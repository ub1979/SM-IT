"""Private stdin/stdout bridge to Appling's Hermes provider stack.

No HTTP listener and no credentials in responses. Account sessions stay alive in
this worker; model calls use Hermes adapters so OAuth, CLI and API keys share
one path. Only SM-IT's existing tools are exposed to the model.
"""
from __future__ import annotations

import asyncio
import json
import sys

_output = sys.stdout
sys.stdout = sys.stderr  # Hermes libraries must never corrupt the JSON protocol.


def model_options(refresh=False):
    from hermes_cli.inventory import build_model_options_payload, load_picker_context
    payload = build_model_options_payload(
        load_picker_context(), explicit_only=False, include_unconfigured=False,
        discover_local_ollama=True, refresh=refresh,
    )
    providers = [
        {"slug": row["slug"], "name": row.get("name") or row["slug"],
         "models": [str(m) for m in row.get("models") or []], "supported": True}
        for row in payload.get("providers") or [] if row.get("slug") != "moa"
    ]
    # The unified picker groups Claude CLI under Anthropic, but the account
    # manager can connect it independently. Preserve every linked account as
    # its own selectable transport rather than forcing it onto an API token.
    from hermes_cli import web_server as web
    from hermes_cli.models import provider_model_ids
    seen = {row["slug"] for row in providers}
    for account in web._build_oauth_catalog():
        if account["id"] in seen:
            continue
        status = web._resolve_provider_status(account["id"], account.get("status_fn"))
        if not status.get("logged_in"):
            continue
        providers.append({"slug": account["id"], "name": account["name"],
                          "models": provider_model_ids(account["id"]), "supported": True})
    return {"provider": payload.get("provider") or "", "model": payload.get("model") or "", "providers": providers}


def response_json(value):
    """Hermes adapters return either SDK models or SimpleNamespace objects."""
    if hasattr(value, "model_dump"):
        return value.model_dump(mode="json")
    if isinstance(value, dict):
        return {key: response_json(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [response_json(item) for item in value]
    if hasattr(value, "__dict__"):
        return response_json(vars(value))
    return value



def inference(body):
    from agent.auxiliary_client import (
        resolve_provider_client, _build_call_kwargs, _create_with_progress,
        _provider_requires_stream, _is_anthropic_compat_endpoint,
        _convert_openai_images_to_anthropic,
    )
    provider, model = body["provider"], body["model"]
    request = body["request"]
    client, resolved = resolve_provider_client(provider, model=model)
    if client is None:
        raise ValueError("This account needs to be connected again in Settings > AI.")
    base_url = str(getattr(client, "base_url", "") or "")
    effort = body.get("effort") or "high"
    kwargs = _build_call_kwargs(
        provider, resolved or model, request["messages"],
        temperature=request.get("temperature"),
        max_tokens=request.get("max_completion_tokens") or request.get("max_tokens"),
        tools=request.get("tools"), timeout=120,
        reasoning_config={"enabled": effort != "off", "effort": effort},
        base_url=base_url,
    )
    for key in ("tool_choice", "response_format", "stop", "seed", "top_p"):
        if key in request:
            kwargs[key] = request[key]
    if _is_anthropic_compat_endpoint(provider, base_url):
        kwargs["messages"] = _convert_openai_images_to_anthropic(kwargs["messages"])
    try:
        result = _create_with_progress(
            client, kwargs, force_stream=_provider_requires_stream(provider, base_url),
        )
        return response_json(result)
    finally:
        close = getattr(client, "close", None)
        if close:
            close()


async def dispatch(action, body):
    if action == "options":
        return await asyncio.to_thread(model_options, bool(body.get("refresh")))
    if action == "infer":
        return await asyncio.to_thread(inference, body)

    # Reuse Appling's catalog and account implementation, without starting its
    # dashboard. Authentication of these private calls is owned by NestJS.
    from hermes_cli import web_server as web
    if action == "catalog":
        accounts = await web.list_oauth_providers()
        fields = await web.get_env_vars()
        return {
            "accounts": [
                {"id": p["id"], "name": p["name"], "flow": p["flow"],
                 "command": p.get("cli_command"), "docsUrl": p.get("docs_url"),
                 "connected": bool(p.get("status", {}).get("logged_in"))}
                for p in accounts["providers"]
            ],
            "fields": {
                key: {"provider": value.get("provider"),
                      "name": value.get("provider_label") or value.get("provider"),
                      "description": value.get("description"),
                      "secret": value.get("is_password", True),
                      "configured": value.get("is_set", False),
                      "advanced": value.get("advanced", False)}
                for key, value in fields.items()
                if value.get("category") == "provider" and value.get("provider")
            },
            "endpoints": web.list_custom_endpoints()["endpoints"],
        }
    if action == "save-key":
        fields = await web.get_env_vars()
        key = body["key"]
        if key not in fields or fields[key].get("category") != "provider":
            raise ValueError("Choose a credential from the provider catalog.")
        if not body.get("value", "").strip():
            raise ValueError("Enter a credential value.")
        await web.set_env_var(web.EnvVarUpdate(key=key, value=body["value"]))
        return {"saved": True}
    if action == "save-endpoint":
        endpoint = web.CustomEndpointUpdate(**body, make_default=False)
        result = web.upsert_custom_endpoint(endpoint)
        return {"saved": True, "id": result["id"]}
    if action == "start-login":
        web._gc_oauth_sessions()
        entry = next((p for p in web._build_oauth_catalog() if p["id"] == body["provider"]), None)
        if not entry:
            raise ValueError("Unknown provider.")
        if entry["flow"] == "external":
            return {"flow": "external", "command": entry["cli_command"]}
        if entry["flow"] == "pkce" and entry["id"] == "anthropic":
            return web._start_anthropic_pkce()
        return await web._start_device_code_flow(entry["id"])
    if action == "poll-login":
        result = await web.poll_oauth_session(body["provider"], body["sessionId"])
        return {key: result.get(key) for key in ("session_id", "status", "expires_at")}
    if action == "submit-login":
        if body["provider"] != "anthropic":
            raise ValueError("This provider does not use a pasted code.")
        result = await asyncio.to_thread(web._submit_anthropic_pkce, body["sessionId"], body["code"])
        return {"ok": bool(result.get("ok")), "status": result.get("status")}
    if action == "cancel-login":
        with web._oauth_sessions_lock:
            web._oauth_sessions.pop(body["sessionId"], None)
        return {"cancelled": True}
    raise ValueError("Unknown AI connection action.")


async def handle(message):
    request_id = message.get("id")
    try:
        value = await dispatch(message["action"], message.get("body") or {})
        reply = {"id": request_id, "value": value}
    except Exception:
        # Provider exception strings can contain keys, auth codes or URLs.
        reply = {"id": request_id, "error": "The AI provider could not complete this request. Check the connection in Settings > AI and try again."}
    _output.write(json.dumps(reply, ensure_ascii=False) + "\n")
    _output.flush()


async def main():
    pending = set()
    while line := await asyncio.to_thread(sys.stdin.readline):
        try:
            message = json.loads(line)
        except (ValueError, TypeError):
            continue
        task = asyncio.create_task(handle(message))
        pending.add(task)
        task.add_done_callback(pending.discard)
    if pending:
        await asyncio.gather(*pending)


if __name__ == "__main__":
    asyncio.run(main())

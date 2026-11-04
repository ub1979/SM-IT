"""Run with Hermes' Python: python -m unittest discover -s scripts/tests."""
import asyncio
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch, MagicMock

# Tests never use or change the owner's Hermes configuration.
_TEST_HOME = tempfile.TemporaryDirectory(prefix='smit-hermes-test-')
os.environ['HERMES_HOME'] = _TEST_HOME.name
spec = importlib.util.spec_from_file_location('smit_bridge', Path(__file__).parents[1] / 'hermes_bridge.py')
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)


class ConnectionTests(unittest.IsolatedAsyncioTestCase):
    async def test_catalog_matches_appling_and_does_not_reveal_credentials(self):
        from hermes_cli import web_server as web
        catalog = await bridge.dispatch('catalog', {})
        appling = await web.list_oauth_providers()
        self.assertEqual({a['id'] for a in catalog['accounts']}, {a['id'] for a in appling['providers']})
        self.assertIn('openai-codex', {a['id'] for a in catalog['accounts']})
        self.assertIn('ANTHROPIC_API_KEY', catalog['fields'])
        self.assertNotIn('JWT_SECRET', catalog['fields'])
        self.assertTrue(all('redacted_value' not in field for field in catalog['fields'].values()))

    async def test_key_save_roundtrips_without_returning_secret(self):
        from hermes_cli.config import load_env
        secret = 'smit-test-key-never-return-this'
        result = await bridge.dispatch('save-key', {'key': 'ANTHROPIC_API_KEY', 'value': secret})
        self.assertEqual(load_env()['ANTHROPIC_API_KEY'], secret)
        self.assertNotIn(secret, json.dumps(result))
        catalog = await bridge.dispatch('catalog', {})
        self.assertTrue(catalog['fields']['ANTHROPIC_API_KEY']['configured'])
        self.assertNotIn(secret, json.dumps(catalog))

    async def test_cannot_change_non_provider_environment(self):
        for key in ['PATH', 'JWT_SECRET', 'DATABASE_URL']:
            with self.assertRaises(ValueError):
                await bridge.dispatch('save-key', {'key': key, 'value': 'bad'})

    async def test_custom_endpoint_does_not_switch_appling_default(self):
        from hermes_cli.config import load_config
        original = load_config().get('model')
        result = await bridge.dispatch('save-endpoint', {
            'name': 'SM-IT Test Gateway', 'base_url': 'http://127.0.0.1:1234/v1',
            'model': 'test-model', 'api_key': 'test-endpoint-secret', 'discover_models': False,
        })
        self.assertTrue(result['saved'])
        self.assertEqual(load_config().get('model'), original)
        catalog = await bridge.dispatch('catalog', {})
        self.assertTrue(any(e['model'] == 'test-model' for e in catalog['endpoints']))
        self.assertNotIn('test-endpoint-secret', json.dumps(catalog))

    async def test_external_cli_connection_has_manual_signin_command(self):
        result = await bridge.dispatch('start-login', {'provider': 'copilot-acp'})
        self.assertEqual(result['flow'], 'external')
        self.assertIn('login', result['command'])

    async def test_login_poll_keeps_session_state_but_not_provider_error_text(self):
        from hermes_cli import web_server as web
        async def poll(*args):
            return {'session_id': 'test-session', 'status': 'error', 'error_message': 'secret-token'}
        with patch.object(web, 'poll_oauth_session', poll):
            result = await bridge.dispatch('poll-login', {'provider': 'nous', 'sessionId': 'test-session'})
        self.assertEqual(result['status'], 'error')
        self.assertNotIn('secret-token', json.dumps(result))

    async def test_provider_error_never_exposes_secret(self):
        out = io.StringIO()
        with patch.object(bridge, '_output', out), patch.object(bridge, 'dispatch', side_effect=RuntimeError('secret-token')):
            await bridge.handle({'id': 42, 'action': 'infer'})
        result = json.loads(out.getvalue())
        self.assertEqual(result['id'], 42)
        self.assertIn('error', result)
        self.assertNotIn('secret-token', out.getvalue())


class InferenceTests(unittest.TestCase):
    def test_every_transport_preserves_tools_and_selected_model(self):
        from agent import auxiliary_client as aux
        for provider in ['anthropic', 'openai-codex', 'copilot', 'copilot-acp', 'claude-cli', 'gemini', 'bedrock', 'custom:test', 'ollama-local']:
            with self.subTest(provider=provider):
                client = MagicMock()
                client.base_url = 'http://localhost/v1'
                response = {'id': 'test', 'choices': [{'message': {'role': 'assistant', 'content': None, 'tool_calls': [{'id': 'call_1', 'type': 'function', 'function': {'name': 'listChannels', 'arguments': '{}'}}]}, 'finish_reason': 'tool_calls'}]}
                client.chat.completions.create.return_value.model_dump.return_value = response
                tools = [{'type': 'function', 'function': {'name': 'listChannels', 'parameters': {'type': 'object', 'properties': {}}}}]
                with patch.object(aux, 'resolve_provider_client', return_value=(client, 'selected-model')) as resolve:
                    result = bridge.inference({'provider': provider, 'model': 'selected-model', 'effort': 'off', 'request': {'messages': [{'role': 'user', 'content': 'List channels'}], 'tools': tools}})
                resolve.assert_called_once_with(provider, model='selected-model')
                call = client.chat.completions.create.call_args.kwargs
                self.assertEqual(call['model'], 'selected-model')
                self.assertEqual(call['tools'], tools)
                self.assertEqual(result['choices'][0]['finish_reason'], 'tool_calls')
                client.close.assert_called_once()

    def test_subscription_namespace_response_is_serializable(self):
        result = SimpleNamespace(id='reply', choices=[SimpleNamespace(message=SimpleNamespace(role='assistant', content='OK'), finish_reason='stop')], usage=SimpleNamespace(prompt_tokens=3, completion_tokens=1))
        normalized = bridge.response_json(result)
        self.assertEqual(normalized['choices'][0]['message']['content'], 'OK')
        self.assertEqual(json.loads(json.dumps(normalized))['usage']['completion_tokens'], 1)

    def test_unavailable_provider_does_not_fall_back_to_another_account(self):
        from agent import auxiliary_client as aux
        with patch.object(aux, 'resolve_provider_client', return_value=(None, None)):
            with self.assertRaises(ValueError):
                bridge.inference({'provider': 'openai-codex', 'model': 'selected', 'request': {'messages': []}})


if __name__ == '__main__':
    unittest.main()

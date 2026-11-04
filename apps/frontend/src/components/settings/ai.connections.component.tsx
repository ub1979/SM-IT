'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@tl_smp/helpers/utils/custom.fetch';
import { useToaster } from '@tl_smp/react/toaster/toaster';

interface Account {
  id: string;
  name: string;
  flow: string;
  command?: string;
  connected: boolean;
}
interface Field {
  provider: string;
  name: string;
  description: string;
  secret: boolean;
  configured: boolean;
  advanced: boolean;
}
interface Catalog {
  accounts: Account[];
  fields: Record<string, Field>;
  endpoints: { id: string; name: string; base_url: string; model: string }[];
}
interface Login {
  provider: string;
  name: string;
  flow: string;
  session_id?: string;
  auth_url?: string;
  verification_url?: string;
  user_code?: string;
  command?: string;
  poll_interval?: number;
}
const fieldClass =
  'w-full rounded-[10px] border border-newBorder bg-newBgColorInner px-[12px] py-[10px] text-[14px]';

export function AiConnections({
  onChanged,
}: {
  onChanged: () => Promise<unknown>;
}) {
  const fetch = useFetch();
  const toaster = useToaster();
  const load = useCallback(async () => {
    const response = await fetch('/settings/ai/connections');
    if (!response.ok)
      throw new Error(
        'AI connections could not be loaded. Check that Hermes is available.'
      );
    return response.json();
  }, [fetch]);
  const { data, error, isLoading, mutate } = useSWR<Catalog>(
    '/settings/ai/connections',
    load,
    { revalidateOnFocus: false }
  );
  const [tab, setTab] = useState('accounts');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [login, setLogin] = useState<Login>();
  const [code, setCode] = useState('');
  const [keyProvider, setKeyProvider] = useState('');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [endpoint, setEndpoint] = useState({
    name: '',
    base_url: '',
    model: '',
    api_key: '',
  });

  const action = useCallback(
    async (body: Record<string, unknown>) => {
      const response = await fetch('/settings/ai/connections', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.message === 'string'
            ? result.message
            : 'The connection could not be saved. Try again.'
        );
      return result;
    },
    [fetch]
  );
  const changed = useCallback(async () => {
    await Promise.all([mutate(), onChanged()]);
  }, [mutate, onChanged]);
  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setFailure('');
    try {
      await work();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!login?.session_id || login.flow === 'external') return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await action({
          action: 'poll-login',
          provider: login.provider,
          sessionId: login.session_id,
        });
        if (stopped) return;
        if (result.status === 'approved') {
          setLogin(undefined);
          setCode('');
          await changed();
          toaster.show('Account connected. Choose its model above.', 'success');
          return;
        }
        if (
          ['error', 'expired', 'cancelled', 'denied'].includes(result.status)
        ) {
          setFailure(
            'Sign-in did not complete. Try connecting the account again.'
          );
          setLogin(undefined);
          return;
        }
        timer = setTimeout(poll, Math.max(3, login.poll_interval || 5) * 1000);
      } catch {
        if (!stopped) {
          setFailure('Sign-in status could not be checked. Try again.');
          setLogin(undefined);
        }
      }
    };
    timer = setTimeout(poll, 3000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [login, action, changed, toaster]);

  const groups = useMemo(() => {
    const result = new Map<string, string>();
    for (const field of Object.values(data?.fields || {}))
      result.set(field.provider, field.name);
    return [...result].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);
  const fields = Object.entries(data?.fields || {})
    .filter(([, info]) => info.provider === keyProvider)
    .sort((a, b) => Number(a[1].advanced) - Number(b[1].advanced));
  const accounts = (data?.accounts || []).filter((account) =>
    account.name.toLowerCase().includes(search.toLowerCase())
  );
  const url = login?.auth_url || login?.verification_url;
  const loginUrl = url && /^https:\/\//i.test(url) ? url : undefined;

  return (
    <section
      className="mt-[24px] border border-newBorder rounded-[14px] bg-sixth p-[24px] mobile:p-[16px] flex flex-col gap-[18px]"
      aria-labelledby="ai-connections-title"
    >
      <div>
        <h3 id="ai-connections-title" className="text-[20px] font-semibold">
          Connect AI providers
        </h3>
        <p className="text-[14px] text-textItemBlur leading-[1.7] mt-[6px]">
          Use subscription accounts, API keys, or your own endpoint. Connections
          are shared with Appling through Hermes; your model choice above stays
          specific to SM-IT.
        </p>
      </div>
      <div
        className="flex gap-[6px] flex-wrap"
        role="group"
        aria-label="Connection type"
      >
        {[
          ['accounts', 'Accounts'],
          ['keys', 'API keys & cloud'],
          ['endpoints', 'Custom endpoints'],
        ].map(([id, name]) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={`px-[14px] py-[10px] rounded-[8px] text-[13px] ${
              tab === id
                ? 'bg-boxFocused text-textItemFocused'
                : 'text-textItemBlur hover:bg-boxFocused'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      {isLoading && (
        <p role="status" className="text-[14px] text-textItemBlur">
          Loading the Appling provider catalog…
        </p>
      )}
      {error && (
        <div role="alert" className="text-[14px]">
          {error.message}{' '}
          <button className="underline" onClick={() => mutate()}>
            Try again
          </button>
        </div>
      )}
      {failure && (
        <p role="alert" className="text-[14px] text-red-400">
          {failure}
        </p>
      )}
      {data && tab === 'accounts' && (
        <>
          <label className="text-[13px]">
            Find an account provider
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={`${fieldClass} mt-[6px]`}
              placeholder="Search providers"
            />
          </label>
          <div className="grid grid-cols-2 mobile:grid-cols-1 gap-[10px]">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-newBgColorInner border border-newBorder rounded-[10px] p-[14px] flex items-center justify-between gap-[12px]"
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-medium">{account.name}</div>
                  <div className="text-[12px] text-textItemBlur mt-[4px]">
                    {account.connected
                      ? 'Connected'
                      : account.flow === 'external'
                      ? 'Connect with its CLI'
                      : 'Sign in with your account'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy || !!login}
                  className="text-[13px] text-textItemFocused rounded-[8px] bg-boxFocused px-[12px] py-[9px] disabled:opacity-50"
                  onClick={() =>
                    run(async () => {
                      const result = await action({
                        action: 'start-login',
                        provider: account.id,
                      });
                      setLogin({
                        ...result,
                        provider: account.id,
                        name: account.name,
                      });
                      setCode('');
                    })
                  }
                >
                  {account.connected ? 'Reconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
          {!accounts.length && (
            <p className="text-[14px] text-textItemBlur">
              No matching account providers. You can also connect through an API
              key or custom endpoint.
            </p>
          )}
        </>
      )}
      {login && (
        <div
          className="rounded-[12px] p-[18px] border border-newBorder bg-newBgColorInner flex flex-col gap-[12px]"
          role="region"
          aria-label={`Connect ${login.name}`}
        >
          <h4 className="font-semibold">Connect {login.name}</h4>
          {login.flow === 'external' ? (
            <>
              <p className="text-[14px] text-textItemBlur">
                Run this command in your terminal, complete sign-in, then
                refresh your connections.
              </p>
              <code className="p-[12px] bg-btnSimple rounded-[8px] text-[13px] break-all select-all">
                {login.command}
              </code>
              <button
                className="studio-primary self-start"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await changed();
                    setLogin(undefined);
                  })
                }
              >
                Refresh connections
              </button>
            </>
          ) : (
            <>
              <p className="text-[14px] text-textItemBlur">
                Complete sign-in with the provider. This page will update when
                your account is connected.
              </p>
              {login.user_code && (
                <div
                  className="text-[24px] font-semibold tracking-[3px] select-all"
                  aria-label="Sign-in code"
                >
                  {login.user_code}
                </div>
              )}
              {loginUrl && (
                <a
                  className="studio-primary self-start"
                  href={loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open {login.name} sign-in ↗
                </a>
              )}
              {login.flow === 'pkce' && (
                <form
                  className="flex flex-col gap-[10px]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    run(async () => {
                      const result = await action({
                        action: 'submit-login',
                        provider: login.provider,
                        sessionId: login.session_id,
                        code,
                      });
                      if (!result.ok)
                        throw new Error(
                          'The code was not accepted. Try signing in again.'
                        );
                      setCode('');
                      setLogin(undefined);
                      await changed();
                    });
                  }}
                >
                  <label className="text-[13px]">
                    Authorization code
                    <input
                      type="password"
                      autoComplete="off"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      className={`${fieldClass} mt-[6px]`}
                      required
                    />
                  </label>
                  <button
                    disabled={busy || !code}
                    className="studio-primary self-start"
                  >
                    Complete sign-in
                  </button>
                </form>
              )}
            </>
          )}
          <button
            type="button"
            className="text-[13px] text-textItemBlur underline self-start"
            onClick={() =>
              run(async () => {
                if (login.session_id)
                  await action({
                    action: 'cancel-login',
                    sessionId: login.session_id,
                  });
                setCode('');
                setLogin(undefined);
              })
            }
          >
            Cancel
          </button>
        </div>
      )}
      {data && tab === 'keys' && (
        <form
          className="flex flex-col gap-[14px]"
          onSubmit={(event) => {
            event.preventDefault();
            run(async () => {
              await action({ action: 'save-key', key, value });
              setValue('');
              await changed();
              toaster.show('Credential saved in Hermes.', 'success');
            });
          }}
        >
          <p className="text-[14px] text-textItemBlur">
            All providers come from Appling’s catalog, including cloud
            credentials and advanced settings. Saved values are never shown
            here.
          </p>
          <label className="text-[13px]">
            Provider
            <select
              className={`${fieldClass} mt-[6px]`}
              value={keyProvider}
              onChange={(event) => {
                setKeyProvider(event.target.value);
                setKey('');
                setValue('');
              }}
              required
            >
              <option value="">Choose a provider</option>
              {groups.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          {keyProvider && (
            <label className="text-[13px]">
              Credential or setting
              <select
                className={`${fieldClass} mt-[6px]`}
                value={key}
                onChange={(event) => {
                  setKey(event.target.value);
                  setValue('');
                }}
                required
              >
                <option value="">Choose a field</option>
                {fields.map(([name, field]) => (
                  <option key={name} value={name}>
                    {name}
                    {field.configured ? ' · saved' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          {key && (
            <label className="text-[13px]">
              {data.fields[key]?.description || key}
              <input
                className={`${fieldClass} mt-[6px]`}
                type={data.fields[key]?.secret ? 'password' : 'text'}
                autoComplete="off"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                required
                placeholder={
                  data.fields[key]?.configured
                    ? 'Enter a replacement value'
                    : 'Enter a value'
                }
              />
            </label>
          )}
          <button
            disabled={busy || !key || !value.trim()}
            className="studio-primary self-start disabled:opacity-50"
          >
            Save credential
          </button>
        </form>
      )}
      {data && tab === 'endpoints' && (
        <>
          {data.endpoints.map((item) => (
            <div
              key={item.id}
              className="text-[14px] p-[12px] rounded-[8px] border border-newBorder"
            >
              <strong>{item.name}</strong>
              <p className="text-textItemBlur text-[12px] break-all mt-[4px]">
                {item.base_url} · {item.model}
              </p>
            </div>
          ))}
          <form
            className="flex flex-col gap-[14px]"
            onSubmit={(event) => {
              event.preventDefault();
              run(async () => {
                await action({ action: 'save-endpoint', ...endpoint });
                setEndpoint({ name: '', base_url: '', model: '', api_key: '' });
                await changed();
                toaster.show(
                  'Endpoint saved. Select its model above.',
                  'success'
                );
              });
            }}
          >
            <p className="text-[14px] text-textItemBlur">
              Connect LM Studio, vLLM, a hosted gateway, or any
              OpenAI-compatible endpoint.
            </p>
            {(
              [
                ['name', 'Connection name'],
                ['base_url', 'Base URL'],
                ['model', 'Model ID'],
                ['api_key', 'API key (optional)'],
              ] as const
            ).map(([name, label]) => (
              <label key={name} className="text-[13px]">
                {label}
                <input
                  className={`${fieldClass} mt-[6px]`}
                  type={
                    name === 'api_key'
                      ? 'password'
                      : name === 'base_url'
                      ? 'url'
                      : 'text'
                  }
                  autoComplete="off"
                  value={endpoint[name]}
                  onChange={(event) =>
                    setEndpoint({ ...endpoint, [name]: event.target.value })
                  }
                  required={name !== 'api_key'}
                  placeholder={
                    name === 'base_url' ? 'http://localhost:1234/v1' : undefined
                  }
                />
              </label>
            ))}
            <button
              disabled={busy}
              className="studio-primary self-start disabled:opacity-50"
            >
              Save endpoint
            </button>
          </form>
        </>
      )}
    </section>
  );
}

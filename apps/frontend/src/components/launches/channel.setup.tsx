'use client';

import { FormEvent, useState } from 'react';
import type { SocialProviderSetup } from '@tl_smp/helpers/utils/social-provider-setup';
import { useFetch } from '@tl_smp/helpers/utils/custom.fetch';

function fieldLabel(key: string) {
  if (key.endsWith('MNEMONIC')) return 'App wallet recovery phrase';
  if (key === 'NEYNAR_APP_FID') return 'App Farcaster ID';
  if (key.includes('BOT_TOKEN') || key === 'TELEGRAM_TOKEN') return 'Bot token';
  if (key.includes('SECRET'))
    return key === 'NEYNAR_SECRET_KEY'
      ? 'Neynar API key'
      : 'Client secret / API secret';
  if (key.includes('API_KEY')) return 'API key';
  return 'App ID / client ID';
}

export function ChannelSetup({
  name,
  identifier,
  setup,
  onConnect,
}: {
  name: string;
  identifier: string;
  setup: SocialProviderSetup;
  onConnect: (setupToken?: string) => Promise<void>;
}) {
  const fetch = useFetch();
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function test(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/integrations/credentials/${identifier}`, {
        method: 'POST',
        body: JSON.stringify({ values }),
      });
      const data = await response.json();
      if (!response.ok || !data.setupToken)
        throw new Error(
          typeof data.message === 'string'
            ? data.message
            : 'Could not start the test. Please try again.'
        );
      await onConnect(data.setupToken);
      setValues({});
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not start the test. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={test}
      className="flex flex-col gap-[14px] text-[14px] leading-[1.5]"
    >
      <p>{setup.instructions}</p>
      {setup.requiresCallback !== false && (
        <div>
          <p>Register this callback URL in your {name} developer app:</p>
          <code className="block mt-[6px] rounded-[8px] bg-btnSimple p-[12px] break-all select-all">
            {setup.callbackUrl}
          </code>
        </div>
      )}
      <div className="flex flex-col gap-[14px]">
        {setup.requiredKeys.map((key) => {
          const saved = !setup.missingKeys.includes(key);
          const secret = /SECRET|TOKEN|API_KEY|MNEMONIC/.test(key);
          return (
            <label
              key={key}
              className="flex flex-col gap-[6px]"
              htmlFor={`credential-${key}`}
            >
              <span className="font-medium">
                {fieldLabel(key)}
                {saved && (
                  <span className="font-normal text-textItemBlur">
                    {' '}
                    · Saved
                  </span>
                )}
              </span>
              <input
                id={`credential-${key}`}
                name={key}
                type={secret ? 'password' : 'text'}
                value={values[key] || ''}
                disabled={busy}
                required={!saved}
                maxLength={8192}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }
                placeholder={
                  saved
                    ? 'Leave blank to keep the saved value'
                    : `Enter ${fieldLabel(key).toLowerCase()}`
                }
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="none"
                className="w-full rounded-[10px] border border-tableBorder bg-btnSimple px-[12px] py-[10px] outline-none focus:border-[#8b7cff] focus:ring-2 focus:ring-[#8b7cff]/30"
              />
              <span className="text-[11px] text-textItemBlur break-all">
                {key}
              </span>
            </label>
          );
        })}
      </div>
      <p
        className="text-textItemBlur text-[13px]"
        id="credential-test-description"
      >
        Continue to {name} to approve access. Your keys are saved to this
        installation’s .env file only after the connection test succeeds.
        Cancelling or failing the test keeps the saved configuration unchanged.
      </p>
      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-[10px]">
        <button
          type="submit"
          disabled={busy}
          aria-describedby="credential-test-description"
          className="rounded-[10px] bg-[#6d5cf5] text-white px-[18px] py-[10px] font-medium disabled:opacity-60"
        >
          {busy ? 'Starting test…' : 'Test and connect'}
        </button>
        {setup.configured && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onConnect()}
            className="rounded-[10px] border border-tableBorder px-[14px] py-[10px]"
          >
            Use saved credentials
          </button>
        )}
      </div>
      <p className="text-textItemBlur text-[12px]">
        App approval and publishing permissions are managed by {name}. A
        successful connection does not remove platform quotas or app review
        requirements.
      </p>
    </form>
  );
}

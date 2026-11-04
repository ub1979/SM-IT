'use client';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { AiConnections } from './ai.connections.component';
import { Button } from '@tl_smp/react/form/button';
import { Select } from '@tl_smp/react/form/select';
import { useFetch } from '@tl_smp/helpers/utils/custom.fetch';
import { useToaster } from '@tl_smp/react/toaster/toaster';
import { useT } from '@tl_smp/react/translation/get.transation.service.client';

interface AiProvider {
  slug: string;
  name: string;
  models: string[];
  supported: boolean;
}

// Plain-language billing hints for the providers people mix up
const PROVIDER_HINTS: Record<string, string> = {
  anthropic: 'API or linked Claude credentials',
  copilot: 'your GitHub Copilot subscription',
  'ollama-local': 'local models through Ollama',
  'ollama-launch': 'local or cloud models through Ollama',
};

export const useAiSettings = () => {
  const fetch = useFetch();
  const load = useCallback(async () => {
    const response = await fetch('/settings/ai');
    if (!response.ok) throw new Error('Could not load AI settings');
    return response.json();
  }, []);
  return useSWR<{ provider: string; model: string; effort: string }>(
    '/settings/ai',
    load,
    { revalidateOnFocus: false }
  );
};

const useAiModels = () => {
  const fetch = useFetch();
  const load = useCallback(async () => {
    const response = await fetch('/settings/ai/models');
    if (!response.ok) throw new Error('Could not load AI models');
    return response.json();
  }, []);
  return useSWR<{ hermesFound: boolean; providers: AiProvider[] }>(
    '/settings/ai/models',
    load,
    { revalidateOnFocus: false }
  );
};

const AiSettingsComponent: FC = () => {
  const t = useT();
  const fetch = useFetch();
  const toaster = useToaster();
  const { data: settings, mutate: mutateSettings } = useAiSettings();
  const { data: options, isLoading, mutate: mutateModels } = useAiModels();
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [effort, setEffort] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (settings) {
      setProvider(settings.provider);
      setModel(settings.model);
      setEffort(settings.effort);
    }
  }, [settings]);

  const providers = useMemo(
    () => (options?.providers || []).filter((p) => p.supported),
    [options]
  );
  const unavailable = useMemo(
    () => (options?.providers || []).filter((p) => !p.supported),
    [options]
  );
  const models = useMemo(
    () => providers.find((p) => p.slug === provider)?.models || [],
    [providers, provider]
  );
  const currentName = useMemo(
    () =>
      providers.find((p) => p.slug === settings?.provider)?.name ||
      settings?.provider,
    [providers, settings]
  );
  const efforts = useMemo(
    () => [
      { value: '', label: t('ai_effort_default', 'Default: high') },
      { value: 'off', label: t('ai_effort_off', 'Off: no extra thinking') },
      {
        value: 'low',
        label: t('ai_effort_low', 'Low: fastest and cheapest, for small tasks'),
      },
      { value: 'medium', label: t('ai_effort_medium', 'Medium: balanced') },
      {
        value: 'high',
        label: t('ai_effort_high', 'High: thinks more, good for most posts'),
      },
      {
        value: 'xhigh',
        label: t('ai_effort_xhigh', 'Extra high: for hard planning'),
      },
      {
        value: 'max',
        label: t('ai_effort_max', 'Max: deepest and slowest, uses the most'),
      },
    ],
    [t]
  );

  const changed =
    provider !== settings?.provider ||
    model !== settings?.model ||
    effort !== settings?.effort;

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch('/settings/ai', {
        method: 'POST',
        body: JSON.stringify({ provider, model: model.trim(), effort }),
      });
      if (!response.ok) throw new Error('Could not save AI settings');
      await mutateSettings();
      toaster.show('Saved. Applies from the next message.', 'success');
    } catch {
      toaster.show(
        'Could not save AI settings. Check the provider connection and try again.',
        'warning'
      );
    } finally {
      setSaving(false);
    }
  }, [fetch, provider, model, effort, mutateSettings, toaster]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/settings/ai/models?refresh=true');
      if (!response.ok) throw new Error('Could not refresh models');
      const list = await response.json();
      await mutateModels(list, { revalidate: false });
    } finally {
      setRefreshing(false);
    }
  }, [fetch, mutateModels]);
  const refreshFromButton = async () => {
    try {
      await refresh();
    } catch {
      toaster.show('Could not refresh models. Try again.', 'warning');
    }
  };

  const changeProvider = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setProvider(event.target.value);
      setModel(
        providers.find((p) => p.slug === event.target.value)?.models[0] || ''
      );
    },
    [providers]
  );

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('ai_settings', 'AI')}</h3>
      <div className="my-[16px] mt-[16px] bg-sixth border-fifth border rounded-[12px] p-[24px] flex flex-col gap-[24px]">
        <div className="flex justify-between gap-[12px] items-start">
          <div className="flex flex-col gap-[4px]">
            <div className="text-[18px]">
              {t('ai_model_and_effort', 'Model and effort')}
            </div>
            <div className="text-[14px] text-customColor18">
              {t('ai_now_using', 'Now using:')}{' '}
              <b>{settings?.model || t('ai_not_set', 'not set')}</b>
              {currentName ? ` · ${currentName}` : ''}
            </div>
            <div className="text-[14px] text-customColor18">
              {t(
                'ai_settings_scope',
                'Choose the provider used by the Agent chat. All linked Hermes accounts are available, including subscriptions, API keys, and CLI connections.'
              )}
            </div>
          </div>
          <Button
            secondary={true}
            loading={refreshing}
            onClick={refreshFromButton}
          >
            {t('ai_refresh_list', 'Refresh list')}
          </Button>
        </div>

        {!isLoading && !providers.length && (
          <div className="text-[14px]">
            {options?.hermesFound
              ? t(
                  'ai_no_models',
                  'No linked models found. Connect an account, API key, or endpoint below.'
                )
              : t(
                  'ai_no_hermes',
                  'Hermes was not found. Set HERMES_PYTHON to the Python used by Appling, then refresh the list.'
                )}
          </div>
        )}

        {isLoading && (
          <div className="text-[14px]">
            {t('ai_looking_for_models', 'Looking for your linked models...')}
          </div>
        )}

        {!!providers.length && (
          <div className="flex flex-col gap-[8px]">
            <Select
              label={t('ai_provider', 'Provider')}
              name="provider"
              disableForm={true}
              hideErrors={true}
              value={provider}
              onChange={changeProvider}
            >
              {!providers.some((p) => p.slug === provider) && (
                <option value={provider}>
                  {provider || t('ai_choose', 'Choose...')}
                </option>
              )}
              {providers.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {PROVIDER_HINTS[p.slug]
                    ? `${p.name}: ${PROVIDER_HINTS[p.slug]}`
                    : p.name}
                </option>
              ))}
            </Select>
            <label className="text-[14px] mt-[12px]">
              {t('ai_model', 'Model')}
              <input
                className="mt-[6px] w-full rounded-[10px] border border-newBorder bg-newBgColorInner px-[12px] py-[10px]"
                list="ai-model-options"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Choose or enter a model ID"
                autoComplete="off"
              />
              <datalist id="ai-model-options">
                {models.map((id) => (
                  <option key={id} value={id} />
                ))}
              </datalist>
            </label>
            <Select
              label={t('ai_effort', 'Effort')}
              name="effort"
              disableForm={true}
              hideErrors={true}
              value={effort}
              onChange={(event) => setEffort(event.target.value)}
            >
              {efforts.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>
            <div className="flex mt-[8px]">
              <Button
                loading={saving}
                disabled={!changed || !provider || !model.trim()}
                onClick={save}
              >
                {t('ai_save', 'Save')}
              </Button>
            </div>
          </div>
        )}

        {!!unavailable.length && (
          <div className="text-[14px] text-customColor18">
            {t(
              'ai_unavailable',
              "Linked but can't be used for the Agent chat, because they only work inside Hermes:"
            )}{' '}
            {unavailable.map((p) => p.name).join(', ')}
          </div>
        )}
      </div>
      <AiConnections onChanged={refresh} />
    </div>
  );
};

export default AiSettingsComponent;

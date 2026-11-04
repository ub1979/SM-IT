import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import type { MastraModelConfig } from '@mastra/core/llm';
import { AiSettingsRepository } from './ai.settings.repository';
import { AiSettingsDto } from '@tl_smp/nestjs-libraries/dtos/settings/ai.settings.dto';
import { AiConnectionActionDto } from '@tl_smp/nestjs-libraries/dtos/settings/ai.connection.dto';
import { HermesBridge } from './hermes.bridge';
import { hermesModel } from './hermes.model';

const OPTIONS_CACHE_MS = 5 * 60 * 1000;
const OPENAI_MODELS = ['gpt-5.2', 'gpt-4.1'];

export interface AiProvider {
  slug: string;
  name: string;
  models: string[];
  supported: boolean;
}
export interface AiModelOptions {
  hermesFound: boolean;
  providers: AiProvider[];
  provider: string;
  model: string;
}

@Injectable()
export class AiSettingsService implements OnModuleDestroy {
  private bridge = new HermesBridge();
  private optionsCache?: { at: number; value: AiModelOptions };

  constructor(private _aiSettingsRepository: AiSettingsRepository) {}

  onModuleDestroy() {
    this.bridge.close();
  }

  async saveSettings(body: AiSettingsDto) {
    const options = await this.getOptions();
    if (
      !options.providers.some((p) => p.slug === body.provider && p.supported)
    ) {
      throw new BadRequestException(
        'Connect this provider in Settings > AI first.'
      );
    }
    return this._aiSettingsRepository.saveSettings(body);
  }

  async getSettings() {
    const saved = await this._aiSettingsRepository.getSettings();
    if (saved)
      return {
        provider: saved.provider,
        model: saved.model,
        effort: saved.effort,
      };
    const options = await this.getOptions();
    const current = options.providers.find(
      (p) => p.slug === options.provider && p.supported
    );
    const fallback = current || options.providers.find((p) => p.supported);
    return {
      provider: fallback?.slug || '',
      model: (current && options.model) || fallback?.models[0] || '',
      effort: '',
    };
  }

  async getOptions(refresh = false): Promise<AiModelOptions> {
    if (
      !refresh &&
      this.optionsCache &&
      Date.now() - this.optionsCache.at < OPTIONS_CACHE_MS
    )
      return this.optionsCache.value;
    const openai: AiProvider[] = process.env.OPENAI_API_KEY
      ? [
          {
            slug: 'openai',
            name: 'OpenAI (key in SM-IT)',
            models: OPENAI_MODELS,
            supported: true,
          },
        ]
      : [];
    try {
      const value: AiModelOptions = {
        ...(await this.bridge.request('options', { refresh })),
        hermesFound: true,
      };
      value.providers = [
        ...value.providers,
        ...openai.filter(
          (p) => !value.providers.some((existing) => existing.slug === p.slug)
        ),
      ];
      this.optionsCache = { at: Date.now(), value };
      return value;
    } catch {
      Logger.warn('Could not read the Hermes AI provider catalog');
      return { hermesFound: false, providers: openai, provider: '', model: '' };
    }
  }

  async getConnections() {
    try {
      return await this.bridge.request('catalog');
    } catch {
      throw new BadRequestException(
        'Could not read AI connections. Check HERMES_PYTHON points to the Python used by Appling.'
      );
    }
  }

  async updateConnection({ action, ...body }: AiConnectionActionDto) {
    try {
      const result = await this.bridge.request(action, body);
      if (
        ['save-key', 'save-endpoint', 'submit-login', 'poll-login'].includes(
          action
        )
      )
        this.optionsCache = undefined;
      return result;
    } catch {
      throw new BadRequestException(
        'The provider could not complete this request. Check the connection and try again.'
      );
    }
  }

  async languageModel(): Promise<MastraModelConfig> {
    const { provider, model, effort } = await this.getSettings();
    if (!provider || !model)
      throw new Error('Choose an AI model in Settings > AI');
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY }).chat(model);
    }
    return hermesModel(this.bridge, provider, model, effort);
  }

  async providerOptions(): Promise<Record<string, any>> {
    const { provider, model, effort } = await this.getSettings();
    // All other transports get their effort normalized by Hermes for the
    // selected model, rather than receiving OpenAI options indiscriminately.
    if (provider !== 'openai' || !process.env.OPENAI_API_KEY) return {};
    const level = effort || 'high';
    return {
      openai:
        level === 'off' || /^gpt-[34]/.test(model)
          ? {}
          : { reasoningEffort: level === 'max' ? 'xhigh' : level },
    };
  }
}

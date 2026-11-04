import { randomBytes } from 'node:crypto';
import { socialProviderSetup } from '@tl_smp/helpers/utils/social-provider-setup';
import {
  invalidateSocialCredentials,
  socialCredentialEnv,
  socialEnvPath,
  withSocialCredentials,
} from './credential-context';
import { saveSocialEnv } from './env-writer';

type Pending = {
  organization: string;
  provider: string;
  values: Record<string, string>;
  state?: string;
  codeVerifier?: string;
  expires: number;
  starting?: boolean;
  signerUuid?: string;
};

// Secrets stay in this backend's memory until a successful platform authorization.
// Restarting the backend or abandoning the flow discards them.
export class SocialCredentialSetup {
  private pending = new Map<string, Pending>();
  private cleanup = setInterval(() => this.prune(), 60_000).unref();
  constructor(
    private persist = (values: Record<string, string>) =>
      saveSocialEnv(socialEnvPath(), values),
    private environment: Record<
      string,
      string | undefined
    > = socialCredentialEnv
  ) {}

  private prune() {
    for (const [token, item] of this.pending)
      if (item.expires <= Date.now()) this.pending.delete(token);
  }

  stage(organization: string, provider: string, input: unknown) {
    this.prune();
    const setup = socialProviderSetup(provider, this.environment);
    if (!setup || !input || typeof input !== 'object' || Array.isArray(input))
      throw new Error('Invalid platform credentials');
    const fields = input as Record<string, unknown>;
    if (Object.keys(fields).some((key) => !setup.requiredKeys.includes(key)))
      throw new Error('Unexpected credential field');
    const values: Record<string, string> = {};
    for (const key of setup.requiredKeys) {
      const supplied = fields[key];
      if (supplied !== undefined && typeof supplied !== 'string')
        throw new Error('Invalid credential value');
      const value =
        (supplied as string | undefined)?.trim() || this.environment[key];
      if (!value || value.length > 8192 || /[\r\n\0]/.test(value))
        throw new Error('Complete all required credential fields');
      values[key] = value;
    }
    if (
      [...this.pending.values()].filter(
        (item) => item.organization === organization
      ).length >= 5
    )
      throw new Error(
        'Too many unfinished tests. Wait 15 minutes and try again.'
      );
    const token = randomBytes(32).toString('hex');
    this.pending.set(token, {
      organization,
      provider,
      values,
      expires: Date.now() + 15 * 60_000,
    });
    return token;
  }

  private get(token: string, organization: string, provider: string) {
    this.prune();
    const pending = this.pending.get(token);
    if (
      !pending ||
      pending.organization !== organization ||
      pending.provider !== provider
    )
      throw new Error(
        'This credential test expired. Enter the keys and try again.'
      );
    return pending;
  }

  async begin(
    token: string,
    organization: string,
    provider: string,
    generate: () => Promise<{
      state: string;
      codeVerifier: string;
      url: string;
    }>
  ) {
    const item = this.get(token, organization, provider);
    if (item.state || item.starting)
      throw new Error('This credential test has already started');
    item.starting = true;
    try {
      const result = await withSocialCredentials(item.values, generate);
      item.state = result.state;
      item.codeVerifier = result.codeVerifier;
      return result;
    } catch {
      this.pending.delete(token);
      throw new Error(
        'Could not start the platform test. Check the keys, callback URL and app access, then try again. No credentials were saved.'
      );
    }
  }

  async run<T>(
    token: string,
    organization: string,
    provider: string,
    action: () => Promise<T>
  ) {
    const item = this.get(token, organization, provider);
    return withSocialCredentials(item.values, action);
  }

  rememberSigner(token: string, organization: string, signerUuid: string) {
    this.get(token, organization, 'wrapcast').signerUuid = signerUuid;
  }

  async complete<
    T extends { id?: string; accessToken?: string; error?: string }
  >(
    state: string,
    organization: string,
    provider: string,
    authenticate: () => Promise<T | string>
  ): Promise<T> {
    this.prune();
    const match = [...this.pending].find(
      ([, item]) =>
        item.state === state &&
        item.organization === organization &&
        item.provider === provider
    );
    if (!match)
      throw new Error(
        'This credential test expired. No credentials were saved.'
      );
    const [token, item] = match;
    this.pending.delete(token); // Single use, including failures.
    let auth: T | string;
    try {
      auth = await withSocialCredentials(item.values, authenticate);
      if (
        typeof auth === 'string' ||
        auth.error ||
        !auth.id ||
        !auth.accessToken
      )
        throw new Error('Rejected');
      if (
        provider === 'wrapcast' &&
        (!item.signerUuid || auth.accessToken !== item.signerUuid)
      )
        throw new Error('Signer mismatch');
      // Discord's app credentials and its publishing bot token are separate.
      if (provider === 'discord') {
        const response = await fetch(
          'https://discord.com/api/v10/oauth2/applications/@me',
          {
            headers: {
              Authorization: `Bot ${item.values.DISCORD_BOT_TOKEN_ID}`,
            },
            signal: AbortSignal.timeout(15_000),
          }
        );
        if (
          !response.ok ||
          (await response.json()).id !== item.values.DISCORD_CLIENT_ID
        )
          throw new Error('Rejected bot token');
      }
    } catch {
      throw new Error(
        'The platform could not verify these credentials and permissions. Check your app settings and try again. No credentials were saved.'
      );
    }
    try {
      await this.persist(item.values);
    } catch {
      throw new Error(
        'The platform verified the keys, but SM-IT could not save its configuration. Check file permissions and try again.'
      );
    }
    Object.assign(process.env, item.values);
    invalidateSocialCredentials();
    return auth;
  }
}

export const socialCredentialSetup = new SocialCredentialSetup();

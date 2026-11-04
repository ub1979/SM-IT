import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'dotenv';
import { SocialCredentialSetup } from '../../libraries/nestjs-libraries/src/integrations/credentials/credential-setup';
import { saveSocialEnv } from '../../libraries/nestjs-libraries/src/integrations/credentials/env-writer';
import {
  socialCredentialEnv,
  withSocialCredentials,
} from '../../libraries/nestjs-libraries/src/integrations/credentials/credential-context';
import { socialProviderSetup } from '../../libraries/helpers/src/utils/social-provider-setup';

const folders: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  await Promise.all(
    folders.splice(0).map((path) => rm(path, { recursive: true, force: true }))
  );
});
const keys = {
  YOUTUBE_CLIENT_ID: 'fixture-client',
  YOUTUBE_CLIENT_SECRET: 'fixture-secret',
};
const grant = { id: 'fixture-account', accessToken: 'fixture-token' };
const start = async () => ({
  state: 'fixture-state',
  codeVerifier: 'fixture-verifier',
  url: 'https://provider.example/authorize',
});

describe('Social credential setup', () => {
  it('covers every environment-configured platform, including non-OAuth bot setup', () => {
    for (const provider of [
      'x',
      'linkedin',
      'linkedin-page',
      'facebook',
      'instagram',
      'instagram-standalone',
      'threads',
      'youtube',
      'gmb',
      'tiktok',
      'tiktok-business',
      'reddit',
      'pinterest',
      'discord',
      'slack',
      'twitch',
      'kick',
      'dribbble',
      'tumblr',
      'mastodon',
      'mewe',
      'vk',
      'whop',
      'telegram',
      'wrapcast',
    ]) {
      expect(
        socialProviderSetup(provider, {})?.requiredKeys.length,
        provider
      ).toBeGreaterThan(0);
    }
  });
  it('shows the exact callback variants used by the platform adapters', () => {
    const env = { FRONTEND_URL: 'http://localhost:4200' };
    expect(socialProviderSetup('slack', env)?.callbackUrl).toBe(
      'https://redirectmeto.com/http://localhost:4200/integrations/social/slack'
    );
    expect(socialProviderSetup('tiktok-business', env)?.callbackUrl).toBe(
      'https://redirectmeto.com/http://localhost:4200/integrations/social/tiktok-business/'
    );
    expect(socialProviderSetup('telegram', env)?.requiresCallback).toBe(false);
  });
  it('stages and starts without persisting, then saves only after a real provider grant', async () => {
    vi.stubEnv('YOUTUBE_CLIENT_ID', 'original-client');
    vi.stubEnv('YOUTUBE_CLIENT_SECRET', 'original-secret');
    const persist = vi.fn().mockResolvedValue(undefined);
    const setup = new SocialCredentialSetup(persist, {});
    const token = setup.stage('owner', 'youtube', keys);
    expect(token).not.toContain('fixture');
    await setup.begin(token, 'owner', 'youtube', async () => {
      expect(socialCredentialEnv.YOUTUBE_CLIENT_SECRET).toBe(
        keys.YOUTUBE_CLIENT_SECRET
      );
      expect(process.env.YOUTUBE_CLIENT_SECRET).toBe('original-secret');
      return start();
    });
    expect(persist).not.toHaveBeenCalled();
    expect(
      await setup.complete('fixture-state', 'owner', 'youtube', async () => {
        expect(socialCredentialEnv.YOUTUBE_CLIENT_SECRET).toBe(
          keys.YOUTUBE_CLIENT_SECRET
        );
        return grant;
      })
    ).toEqual(grant);
    expect(persist).toHaveBeenCalledExactlyOnceWith(keys);
    expect(process.env.YOUTUBE_CLIENT_SECRET).toBe(keys.YOUTUBE_CLIENT_SECRET);
    await expect(
      setup.complete('fixture-state', 'owner', 'youtube', async () => grant)
    ).rejects.toThrow('expired');
  });
  it.each(['throw', 'error', 'empty-token', 'empty-account', 'string'])(
    'never saves after a failed %s result',
    async (failure) => {
      vi.stubEnv('YOUTUBE_CLIENT_SECRET', 'original');
      const persist = vi.fn();
      const setup = new SocialCredentialSetup(persist, {});
      const token = setup.stage('owner', 'youtube', keys);
      await setup.begin(token, 'owner', 'youtube', start);
      await expect(
        setup.complete('fixture-state', 'owner', 'youtube', async () => {
          if (failure === 'throw') throw new Error('DO-NOT-EXPOSE-secret');
          if (failure === 'error')
            return { ...grant, error: 'DO-NOT-EXPOSE-secret' };
          if (failure === 'empty-token') return { ...grant, accessToken: '' };
          if (failure === 'empty-account') return { ...grant, id: '' };
          return 'DO-NOT-EXPOSE-secret';
        })
      ).rejects.toThrow('No credentials were saved');
      expect(persist).not.toHaveBeenCalled();
      expect(process.env.YOUTUBE_CLIENT_SECRET).toBe('original');
    }
  );
  it('does not change runtime credentials when the file cannot be saved', async () => {
    vi.stubEnv('YOUTUBE_CLIENT_SECRET', 'original');
    const setup = new SocialCredentialSetup(async () => {
      throw new Error('private-path');
    }, {});
    const token = setup.stage('owner', 'youtube', keys);
    await setup.begin(token, 'owner', 'youtube', start);
    await expect(
      setup.complete('fixture-state', 'owner', 'youtube', async () => grant)
    ).rejects.toThrow('could not save');
    expect(process.env.YOUTUBE_CLIENT_SECRET).toBe('original');
  });
  it('rejects unknown fields, missing values, injection and unknown providers', () => {
    const setup = new SocialCredentialSetup(vi.fn(), {});
    expect(() =>
      setup.stage('owner', 'youtube', { ...keys, JWT_SECRET: 'injection' })
    ).toThrow('Unexpected');
    expect(() => setup.stage('owner', 'youtube', {})).toThrow('Complete');
    expect(() =>
      setup.stage('owner', 'youtube', {
        ...keys,
        YOUTUBE_CLIENT_SECRET: 'secret\nOTHER=value',
      })
    ).toThrow('Complete');
    expect(() => setup.stage('owner', '__proto__', keys)).toThrow('Invalid');
  });
  it('binds a test to its owner, provider and state, and expires abandoned keys', async () => {
    vi.useFakeTimers();
    const persist = vi.fn();
    const setup = new SocialCredentialSetup(persist, {});
    const token = setup.stage('owner', 'youtube', keys);
    await expect(
      setup.begin(token, 'someone-else', 'youtube', start)
    ).rejects.toThrow('expired');
    await expect(
      setup.begin(token, 'owner', 'linkedin', start)
    ).rejects.toThrow('expired');
    await setup.begin(token, 'owner', 'youtube', start);
    await expect(
      setup.complete('different-state', 'owner', 'youtube', async () => grant)
    ).rejects.toThrow('expired');
    vi.advanceTimersByTime(16 * 60_000);
    await expect(
      setup.complete('fixture-state', 'owner', 'youtube', async () => grant)
    ).rejects.toThrow('expired');
    expect(persist).not.toHaveBeenCalled();
  });
  it('keeps concurrent credential tests separate from one another and from publishing', async () => {
    vi.stubEnv('CONTEXT_TEST_KEY', 'original');
    const result = await Promise.all(
      ['first', 'second'].map((value) =>
        withSocialCredentials({ CONTEXT_TEST_KEY: value }, async () => {
          await Promise.resolve();
          expect(process.env.CONTEXT_TEST_KEY).toBe('original');
          return socialCredentialEnv.CONTEXT_TEST_KEY;
        })
      )
    );
    expect(result).toEqual(['first', 'second']);
    expect(socialCredentialEnv.CONTEXT_TEST_KEY).toBe('original');
  });
  it('does not save Farcaster credentials for a signer outside this test', async () => {
    const persist = vi.fn();
    const setup = new SocialCredentialSetup(persist, {});
    const token = setup.stage('owner', 'wrapcast', {
      NEYNAR_SECRET_KEY: 'fixture-key',
      NEYNAR_APP_FID: '1',
      NEYNAR_APP_MNEMONIC: 'fixture-phrase',
    });
    await setup.begin(token, 'owner', 'wrapcast', start);
    setup.rememberSigner(token, 'owner', 'expected-signer');
    await expect(
      setup.complete('fixture-state', 'owner', 'wrapcast', async () => ({
        ...grant,
        accessToken: 'different-signer',
      }))
    ).rejects.toThrow('No credentials were saved');
    expect(persist).not.toHaveBeenCalled();
  });
  it('verifies the extra Discord publishing token belongs to the same app', async () => {
    const persist = vi.fn();
    const setup = new SocialCredentialSetup(persist, {});
    const token = setup.stage('owner', 'discord', {
      DISCORD_CLIENT_ID: 'app-1',
      DISCORD_CLIENT_SECRET: 'secret',
      DISCORD_BOT_TOKEN_ID: 'token',
    });
    await setup.begin(token, 'owner', 'discord', start);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'different-app' }),
      })
    );
    await expect(
      setup.complete('fixture-state', 'owner', 'discord', async () => grant)
    ).rejects.toThrow('No credentials were saved');
    expect(persist).not.toHaveBeenCalled();
  });
});

describe('Atomic .env persistence', () => {
  it('preserves unrelated configuration and comments, removes duplicates and round-trips punctuation', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'smit-env-test-'));
    folders.push(directory);
    const path = join(directory, '.env');
    await writeFile(
      path,
      '# keep this comment\nDATABASE_URL=untouched\nexport YOUTUBE_CLIENT_ID="old"\nYOUTUBE_CLIENT_ID=duplicate\nYOUTUBE_CLIENT_SECRET="old\nmultiline"\n'
    );
    const values = {
      YOUTUBE_CLIENT_ID: 'new-client',
      YOUTUBE_CLIENT_SECRET: 'space # dollar$ double" slash\\value',
    };
    await saveSocialEnv(path, values);
    const source = await readFile(path, 'utf8');
    expect(source).toContain('# keep this comment\nDATABASE_URL=untouched');
    expect(source.match(/YOUTUBE_CLIENT_ID=/g)).toHaveLength(1);
    expect(parse(source)).toEqual({ DATABASE_URL: 'untouched', ...values });
    expect((await stat(path)).mode & 0o777).toBe(0o600);
  });
  it('serializes independent platform saves without dropping either set of keys', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'smit-env-test-'));
    folders.push(directory);
    const path = join(directory, '.env');
    await Promise.all([
      saveSocialEnv(path, keys),
      saveSocialEnv(path, { LINKEDIN_CLIENT_ID: 'fixture-linkedin' }),
    ]);
    expect(parse(await readFile(path))).toEqual({
      ...keys,
      LINKEDIN_CLIENT_ID: 'fixture-linkedin',
    });
  });
  it('leaves the original file untouched on invalid input', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'smit-env-test-'));
    folders.push(directory);
    const path = join(directory, '.env');
    await writeFile(path, 'ORIGINAL=untouched\n');
    await expect(
      saveSocialEnv(path, { YOUTUBE_CLIENT_SECRET: 'invalid\nINJECT=1' })
    ).rejects.toThrow();
    await expect(
      saveSocialEnv(path, { JWT_SECRET: 'forbidden' })
    ).rejects.toThrow();
    expect(await readFile(path, 'utf8')).toBe('ORIGINAL=untouched\n');
  });
});

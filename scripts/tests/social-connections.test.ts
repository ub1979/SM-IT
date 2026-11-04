import { afterEach, describe, expect, it, vi } from 'vitest';
import { socialProviderSetup } from '../../libraries/helpers/src/utils/social-provider-setup';
import { LinkedinProvider } from '../../libraries/nestjs-libraries/src/integrations/social/linkedin.provider';
import { LinkedinPageProvider } from '../../libraries/nestjs-libraries/src/integrations/social/linkedin.page.provider';
import { DribbbleProvider } from '../../libraries/nestjs-libraries/src/integrations/social/dribbble.provider';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Social connection readiness', () => {
  it('reports missing app keys without ever returning their values', () => {
    const result = socialProviderSetup('x', {
      FRONTEND_URL: 'http://localhost:4200/',
      X_API_KEY: 'private-value',
    });
    expect(result).toMatchObject({
      configured: false,
      missingKeys: ['X_API_SECRET'],
      callbackUrl: 'http://localhost:4200/integrations/social/x',
    });
    expect(JSON.stringify(result)).not.toContain('private-value');
  });
  it('uses X_URL only for X and preserves distinct LinkedIn callbacks', () => {
    const env = {
      FRONTEND_URL: 'http://localhost:4200',
      X_URL: 'https://callback.example',
    };
    expect(socialProviderSetup('x', env)?.callbackUrl).toBe(
      'https://callback.example/integrations/social/x'
    );
    expect(socialProviderSetup('linkedin-page', env)?.callbackUrl).toBe(
      'http://localhost:4200/integrations/social/linkedin-page'
    );
  });
  it('supports the existing Google Business fallback credentials', () => {
    const result = socialProviderSetup('gmb', {
      YOUTUBE_CLIENT_ID: 'id',
      YOUTUBE_CLIENT_SECRET: 'secret',
    });
    expect(result?.configured).toBe(true);
    expect(socialProviderSetup('bluesky', {})).toBeUndefined();
  });
});

describe('LinkedIn authorization', () => {
  it('allows personal publishing with the self-service products', async () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:4200');
    const personal = new LinkedinProvider();
    const url = new URL((await personal.generateAuthUrl()).url);
    expect(url.searchParams.get('scope')?.split(' ')).toEqual([
      'openid',
      'profile',
      'w_member_social',
    ]);
    expect(url.searchParams.has('prompt')).toBe(false);
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:4200/integrations/social/linkedin'
    );
    const page = new LinkedinPageProvider();
    expect(page.scopes).toContain('w_organization_social');
    expect(page.scopes).not.toContain('r_basicprofile');
    expect(
      new URL((await page.generateAuthUrl()).url).searchParams.has('prompt')
    ).toBe(false);
  });
  it('uses the OIDC profile and the same callback when reconnecting', async () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:4200');
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
          scope: 'openid profile w_member_social',
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          sub: 'member-1',
          name: 'Test Member',
          picture: '',
        }),
      });
    vi.stubGlobal('fetch', fetch);
    const result = await new LinkedinProvider().authenticate({
      code: 'test-code',
      codeVerifier: '',
      refresh: 'existing-member',
    });
    expect(result.id).toBe('member-1');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toBe('https://api.linkedin.com/v2/userinfo');
    expect(fetch.mock.calls[0][1].body.get('redirect_uri')).toBe(
      'http://localhost:4200/integrations/social/linkedin'
    );
  });
  it('connects a Page without the legacy profile endpoint', async () => {
    vi.stubEnv('FRONTEND_URL', 'http://localhost:4200');
    const provider = new LinkedinPageProvider();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          access_token: 'test-token',
          scope: provider.scopes.join(' '),
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ sub: 'member-1', name: 'Test' }),
      });
    vi.stubGlobal('fetch', fetch);
    const result = await provider.authenticate({
      code: 'test',
      codeVerifier: '',
    });
    expect(result.id).toBe('linkedin-page_member-1');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toBe('https://api.linkedin.com/v2/userinfo');
  });
});

describe('Dribbble account isolation', () => {
  it('requests reconnection without contacting another platform', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(new DribbbleProvider().refreshToken('unused')).rejects.toThrow(
      'Reconnect your Dribbble'
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps the app secret and authorization code out of the token URL', async () => {
    vi.stubEnv('DRIBBBLE_CLIENT_ID', 'test-client');
    vi.stubEnv('DRIBBBLE_CLIENT_SECRET', 'private-secret');
    vi.stubEnv('FRONTEND_URL', 'http://localhost:4200');
    const provider = new DribbbleProvider();
    const fetch = vi
      .spyOn(provider, 'fetch')
      .mockResolvedValueOnce({
        json: async () => ({
          access_token: 'test-token',
          scope: 'public upload',
        }),
      } as Response)
      .mockResolvedValueOnce({
        json: async () => ({ id: 'test-member', login: 'test', name: 'Test' }),
      } as Response);
    await provider.authenticate({
      code: 'private-code',
      codeVerifier: '',
      refresh: '',
    });
    expect(fetch.mock.calls[0][0]).toBe('https://dribbble.com/oauth/token');
    expect(
      (fetch.mock.calls[0][1]?.body as URLSearchParams).get('client_secret')
    ).toBe('private-secret');
  });
});

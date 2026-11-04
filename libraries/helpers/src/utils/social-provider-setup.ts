export interface SocialProviderSetup {
  configured: boolean;
  missingKeys: string[];
  requiredKeys: string[];
  callbackUrl: string;
  instructions: string;
  requiresCallback?: boolean;
}

const appKeys: Record<string, string[]> = {
  x: ['X_API_KEY', 'X_API_SECRET'],
  linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  'linkedin-page': ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  facebook: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
  instagram: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
  'instagram-standalone': ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET'],
  threads: ['THREADS_APP_ID', 'THREADS_APP_SECRET'],
  youtube: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
  tiktok: ['TIKTOK_CLIENT_ID', 'TIKTOK_CLIENT_SECRET'],
  'tiktok-business': [
    'TIKTOK_BUSINESS_CLIENT_ID',
    'TIKTOK_BUSINESS_CLIENT_SECRET',
  ],
  reddit: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'],
  pinterest: ['PINTEREST_CLIENT_ID', 'PINTEREST_CLIENT_SECRET'],
  discord: [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_BOT_TOKEN_ID',
  ],
  slack: ['SLACK_ID', 'SLACK_SECRET'],
  twitch: ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'],
  kick: ['KICK_CLIENT_ID', 'KICK_SECRET'],
  dribbble: ['DRIBBBLE_CLIENT_ID', 'DRIBBBLE_CLIENT_SECRET'],
  tumblr: ['TUMBLR_CLIENT_ID', 'TUMBLR_CLIENT_SECRET'],
  mastodon: ['MASTODON_CLIENT_ID', 'MASTODON_CLIENT_SECRET'],
  mewe: ['MEWE_APP_ID', 'MEWE_API_KEY'],
  vk: ['VK_ID'],
  whop: ['WHOP_CLIENT_ID'],
  telegram: ['TELEGRAM_TOKEN'],
  wrapcast: ['NEYNAR_SECRET_KEY', 'NEYNAR_APP_FID', 'NEYNAR_APP_MNEMONIC'],
};

export const socialAppCredentialKeys = new Set([
  ...Object.values(appKeys).flat(),
  'GOOGLE_GMB_CLIENT_ID',
  'GOOGLE_GMB_CLIENT_SECRET',
]);

// Return names and readiness only. App secrets must never leave the backend.
export function socialProviderSetup(
  identifier: string,
  env: Record<string, string | undefined>
): SocialProviderSetup | undefined {
  const requiredKeys =
    identifier === 'gmb'
      ? [
          env.GOOGLE_GMB_CLIENT_ID || !env.YOUTUBE_CLIENT_ID
            ? 'GOOGLE_GMB_CLIENT_ID'
            : 'YOUTUBE_CLIENT_ID',
          env.GOOGLE_GMB_CLIENT_SECRET || !env.YOUTUBE_CLIENT_SECRET
            ? 'GOOGLE_GMB_CLIENT_SECRET'
            : 'YOUTUBE_CLIENT_SECRET',
        ]
      : Object.prototype.hasOwnProperty.call(appKeys, identifier)
      ? appKeys[identifier]
      : undefined;
  if (!requiredKeys) return undefined;
  const missingKeys = requiredKeys.filter((key) => !env[key]?.trim());
  const baseUrl =
    (identifier === 'x' && env.X_URL?.trim()) || env.FRONTEND_URL || '';
  const callbackBase =
    [
      'instagram-standalone',
      'threads',
      'slack',
      'tiktok',
      'tiktok-business',
    ].includes(identifier) && baseUrl.startsWith('http:')
      ? `https://redirectmeto.com/${baseUrl}`
      : baseUrl;
  const instructions =
    identifier === 'telegram'
      ? 'Enter your Telegram bot token. Next, add the bot to your group or channel and complete the connection test.'
      : identifier === 'wrapcast'
      ? 'Enter your Neynar API key, app Farcaster ID and app wallet recovery phrase. Approve the signer in Farcaster to verify the connection before these credentials are saved.'
      : identifier === 'x'
      ? 'Create an X developer app with Read and Write access and the API access needed for posting. Use its API Key and API Secret, not its OAuth 2.0 Client ID.'
      : identifier === 'linkedin'
      ? 'Create a LinkedIn developer app and enable Sign In with LinkedIn using OpenID Connect and Share on LinkedIn. This connection posts to your personal profile.'
      : identifier === 'linkedin-page'
      ? 'Use a LinkedIn developer app approved for Community Management and sign in as an administrator of the company Page.'
      : 'Create a developer app with this platform and enable its publishing permissions. Some platforms require an app review before other accounts can connect.';
  return {
    configured: missingKeys.length === 0,
    missingKeys,
    requiredKeys: [...requiredKeys],
    callbackUrl: `${callbackBase.replace(
      /\/+$/,
      ''
    )}/integrations/social/${identifier}${
      identifier === 'tiktok-business' ? '/' : ''
    }`,
    instructions,
    requiresCallback: !['telegram', 'wrapcast'].includes(identifier),
  };
}

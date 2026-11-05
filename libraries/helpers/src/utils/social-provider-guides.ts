export interface SocialProviderGuide {
  name: string;
  account: string;
  access: string;
  steps: string[];
  fields: Record<string, string>;
  troubleshooting: string[];
  links: { label: string; url: string }[];
  permissions: string[];
}

// Setup reference prepared from linked provider documentation and this connector on 2026-11-05.
// Dashboard labels and API eligibility can change; the official links remain the source of truth.
export const socialProviderGuides: Record<string, SocialProviderGuide> = {
  youtube: {
    name: 'YouTube',
    account: 'A Google account with a YouTube channel you can manage.',
    access:
      'OAuth verification and YouTube upload audits are separate. Testing apps have restrictions; unaudited uploads can be limited to private visibility.',
    steps: [
      'Open Google Cloud Console, sign in, and create or select a project for SM-IT.',
      'In APIs & Services > Library, enable YouTube Data API v3 and YouTube Analytics API.',
      'Open Google Auth Platform. Set up Branding, Audience and Data Access for your app. For external testing, add the Google account you will connect as a test user.',
      'In Clients (or APIs & Services > Credentials), create an OAuth client ID with application type Web application. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'Copy that client’s Client ID and Client secret. A Google API key or a service-account JSON file cannot replace this pair.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      YOUTUBE_CLIENT_ID:
        'Google Auth Platform > Clients > your Web application > Client ID.',
      YOUTUBE_CLIENT_SECRET:
        'The Client secret belonging to the same Google OAuth client.',
    },
    troubleshooting: [
      'redirect_uri_mismatch: compare the registered redirect URI with the URL below character for character.',
      'access_denied: check your test-user list, app audience and granted scopes. SM-IT currently also requests youtubepartner; restricted or unsupported scopes may require provider approval or a connector update.',
      'A successful login does not certify public uploads. Check YouTube API quota and upload audit requirements before scheduling.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://console.cloud.google.com/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps',
      },
      {
        label: 'YouTube upload restrictions and audits',
        url: 'https://developers.google.com/youtube/v3/docs/videos/insert',
      },
    ],
    permissions: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
  },
  gmb: {
    name: 'Google Business Profile',
    account:
      'An owner or manager of an eligible, verified business profile, plus a Google Cloud project.',
    access:
      'Google must approve the Cloud project for Business Profile API access. Creating an OAuth client alone does not grant access.',
    steps: [
      'Sign in to Google Business Profile and confirm that your account can manage the location you want to connect.',
      'Create or select a Google Cloud project. Use its project number to submit the Business Profile API access request described in the official prerequisites. Wait for approval.',
      'Enable the Business Profile APIs needed by the connector, including Account Management, Business Information, Performance and Google My Business (for local posts). Follow Google’s basic setup list.',
      'Configure Google Auth Platform branding, audience and the business.manage permission. Add your account as a test user if the app is in external testing.',
      'Create a Web application OAuth client. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings. Copy its Client ID and Client secret into the fields shown here. This installation may use the existing YouTube pair as a fallback.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      GOOGLE_GMB_CLIENT_ID:
        'Google Auth Platform > Clients > Web application > Client ID.',
      GOOGLE_GMB_CLIENT_SECRET: 'Client secret of that Google Web application.',
      YOUTUBE_CLIENT_ID:
        'This installation currently falls back to the saved Google/YouTube Web client ID. Register the Business Profile callback on that client too.',
      YOUTUBE_CLIENT_SECRET:
        'Client secret of the same fallback Google Web application.',
    },
    troubleshooting: [
      'A zero API quota commonly indicates that the project has not been approved.',
      'An empty location list can mean that the signed-in Google account does not manage the business or that an API is not enabled.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://console.cloud.google.com/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.google.com/my-business/content/prereqs',
      },
      {
        label: 'Google Business API setup',
        url: 'https://developers.google.com/my-business/content/basic-setup',
      },
    ],
    permissions: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/business.manage',
    ],
  },
  x: {
    name: 'X',
    account: 'An X account and approved access to the X Developer Console.',
    access:
      'Posting needs suitable API access and available credits or a paid agreement. Check the current console pricing before enabling automation.',
    steps: [
      'Sign in to the X Developer Console, complete developer onboarding and describe your publishing use case.',
      'Create an app for SM-IT and open its user authentication settings. This connector uses OAuth 1.0a.',
      'Set app permissions to Read and write. Enter the app website and any required application information. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'In Keys and tokens, generate or reveal API Key and API Key Secret. Use this OAuth 1.0a pair; do not paste an OAuth 2.0 Client ID, bearer token or user access token in these fields.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      X_API_KEY:
        'Developer Console > app > Keys and tokens > API Key (OAuth 1.0a).',
      X_API_SECRET: 'API Key Secret for the same app.',
    },
    troubleshooting: [
      'If X refuses localhost, its current guide specifies 127.0.0.1 for local callbacks. Ask the installation owner to align SM-IT’s X callback base (X_URL) with the accepted address, then register the newly displayed callback.',
      'A permission or API-access error after login can reflect the app’s access tier, credit balance, or compatibility of this OAuth 1.0a connector with the enabled endpoints. Reconnect after changing app permissions.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://console.x.com/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://docs.x.com/fundamentals/developer-apps',
      },
    ],
    permissions: [],
  },
  linkedin: {
    name: 'LinkedIn profile',
    account:
      'A LinkedIn member account and an app associated with a LinkedIn Page you can verify.',
    access:
      'Personal publishing uses the Share on LinkedIn product. Company Page publishing uses the separate LinkedIn Page connection.',
    steps: [
      'Sign in at LinkedIn Developers > My apps > Create app. Supply the app name, associated LinkedIn Page, logo and required legal details.',
      'Complete app/Page verification with the Page administrator if LinkedIn requests it.',
      'In Products, enable or request Share on LinkedIn and Sign In with LinkedIn using OpenID Connect. Confirm access is granted.',
      'In Auth, add the callback shown below to Authorized redirect URLs. Copy Client ID and reveal Client Secret.',
      'Confirm the app can request openid, profile and w_member_social. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      LINKEDIN_CLIENT_ID: 'LinkedIn Developers > your app > Auth > Client ID.',
      LINKEDIN_CLIENT_SECRET:
        'Auth > Client Secret, revealed for that same app.',
    },
    troubleshooting: [
      'Invalid scope: the required product may still be pending or unavailable for the app.',
      'This choice publishes as a member profile. Choose LinkedIn Page if you want to publish as a company.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://www.linkedin.com/developers/apps',
      },
      {
        label: 'Official setup documentation',
        url: 'https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access',
      },
    ],
    permissions: ['openid', 'profile', 'w_member_social'],
  },
  'linkedin-page': {
    name: 'LinkedIn Page',
    account:
      'A LinkedIn Page administrator and an eligible LinkedIn developer app.',
    access:
      'Community Management access is reviewed by LinkedIn; ordinary Share on LinkedIn access is insufficient for organization posting.',
    steps: [
      'Create a LinkedIn app associated with the company Page and complete its app verification.',
      'Request the Community Management product and the appropriate access tier. Provide the use case and any evidence LinkedIn asks for, then wait for approval.',
      'Confirm the granted permissions cover organization administration, organization posting and reading organization content. This connector also requests member sign-in and publishing scopes.',
      'In Auth, register this LinkedIn Page callback separately from the personal-profile callback. Copy the app Client ID and Client Secret.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
      'After authorization, select the company Page you administer and finish connecting it.',
    ],
    fields: {
      LINKEDIN_CLIENT_ID: 'LinkedIn Developers > your app > Auth > Client ID.',
      LINKEDIN_CLIENT_SECRET:
        'Auth > Client Secret, revealed for that same app.',
    },
    troubleshooting: [
      'A missing organization scope needs product approval; generating another secret cannot add that permission.',
      'If the Page is missing, verify the signed-in member’s Page admin role. LinkedIn profile and Page connections share the installation’s LinkedIn app credentials.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://www.linkedin.com/developers/apps',
      },
      {
        label: 'Official setup documentation',
        url: 'https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-api/overview',
      },
    ],
    permissions: [
      'openid',
      'profile',
      'w_member_social',
      'rw_organization_admin',
      'w_organization_social',
      'r_organization_social',
    ],
  },
  facebook: {
    name: 'Facebook Page',
    account:
      'A Facebook account with sufficient access to a Facebook Page and a Meta developer account.',
    access:
      'Page publishing, not personal Facebook profile posting. App review may be needed for accounts outside your app roles.',
    steps: [
      'Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.',
      'Configure Facebook Login for the app and enter the website and required app details. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'Enable the Page permissions requested by SM-IT, including pages_show_list, pages_manage_posts, pages_read_engagement and the additional management/insights permissions listed below.',
      'In App settings > Basic, copy App ID and reveal App Secret. These are the Meta app credentials, not a temporary Page access token.',
      'In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Select the Page you intend to publish to.',
    ],
    fields: {
      FACEBOOK_APP_ID: 'Meta app dashboard > App settings > Basic > App ID.',
      FACEBOOK_APP_SECRET: 'App settings > Basic > App Secret.',
    },
    troubleshooting: [
      'No Pages listed: check your Page access and grant access to the Page in the Facebook consent screen.',
      'A permission being visible in a dashboard does not mean it has advanced access. Check App Review > Permissions and Features.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://developers.facebook.com/apps/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.facebook.com/docs/pages-api/getting-started/',
      },
    ],
    permissions: [
      'pages_show_list',
      'business_management',
      'pages_manage_posts',
      'pages_manage_engagement',
      'pages_read_engagement',
      'read_insights',
    ],
  },
  instagram: {
    name: 'Instagram via Facebook',
    account:
      'An Instagram professional account connected to a Facebook Page, and access to manage that Page.',
    access:
      'Personal Instagram accounts are not supported by this API route. Meta review may be needed beyond app-role accounts.',
    steps: [
      'Change the Instagram account to a professional account if necessary, and link it to a Facebook Page you manage.',
      'Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.',
      'Configure Instagram API with Facebook Login and its Facebook Login settings. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'Enable instagram_basic, instagram_content_publish and the Page, insights and comment permissions that this connector requests. In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.',
      'Copy the Meta app App ID and App Secret from App settings > Basic. These fields are shared with the Facebook Page connection.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Select the Page/Instagram account when prompted.',
    ],
    fields: {
      FACEBOOK_APP_ID: 'Meta app dashboard > App settings > Basic > App ID.',
      FACEBOOK_APP_SECRET: 'App settings > Basic > App Secret.',
    },
    troubleshooting: [
      'An empty account list often means the Instagram account is not professional or is not linked to the authorized Page.',
      'Media must satisfy Instagram’s publishing rules and be reachable by Meta; a local-only media URL cannot be fetched by Meta.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://developers.facebook.com/apps/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/',
      },
    ],
    permissions: [
      'instagram_basic',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
    ],
  },
  'instagram-standalone': {
    name: 'Instagram with Instagram Login',
    account:
      'An Instagram Business or Creator account and a Meta developer app configured for Instagram Login.',
    access:
      'This route uses Instagram app credentials and professional accounts; it does not require linking a Facebook Page.',
    steps: [
      'Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.',
      'Choose Instagram API with Instagram Login. Set up the app and add the Instagram professional account as a tester when developing.',
      'Register the callback displayed below in the Instagram login settings. Accept any tester invitation in the Instagram account.',
      'Enable instagram_business_basic, instagram_business_content_publish and the comments/insights permissions requested by this connector. In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.',
      'Copy the Instagram App ID and Instagram App Secret shown in the Instagram product setup. These are distinct from the Facebook credentials used by the other Instagram connection.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      INSTAGRAM_APP_ID:
        'Instagram product > API setup with Instagram Login > Instagram App ID.',
      INSTAGRAM_APP_SECRET:
        'The Instagram App Secret from the same Instagram product setup.',
    },
    troubleshooting: [
      'Do not use a personal Instagram account or paste the Facebook app pair into the Instagram-specific fields.',
      'For local installations, the current connector may display a redirect relay URL. Register the displayed URL exactly; if the provider rejects it, a separately secured HTTPS callback setup is required.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://developers.facebook.com/apps/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started',
      },
    ],
    permissions: [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights',
    ],
  },
  threads: {
    name: 'Threads',
    account: 'A Threads profile and a Meta developer account.',
    access:
      'App-role/tester accounts can test; connecting other users can require reviewed permissions.',
    steps: [
      'Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.',
      'Select the Threads API use case/product. Configure the app’s website, privacy policy and other required information.',
      'In the Threads settings, add the callback below and add your Threads account as a tester. Accept the tester invitation in the account if required.',
      'Enable threads_basic and threads_content_publish, plus the reply, insights and discovery scopes requested by this connector.',
      'Copy the Threads App ID and Threads App Secret from the Threads API setup. In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      THREADS_APP_ID:
        'Meta dashboard > Threads API use case/settings > Threads App ID.',
      THREADS_APP_SECRET: 'Threads App Secret from that same Threads setup.',
    },
    troubleshooting: [
      'If authorization fails in development mode, check that the Threads tester invitation has been accepted.',
      'Publishing media requires URLs that Threads can retrieve, not local filesystem paths.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://developers.facebook.com/apps/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.facebook.com/docs/threads/get-started',
      },
    ],
    permissions: [
      'threads_basic',
      'threads_content_publish',
      'threads_manage_replies',
      'threads_manage_insights',
      'threads_profile_discovery',
    ],
  },
  tiktok: {
    name: 'TikTok',
    account: 'A TikTok account and a TikTok for Developers account.',
    access:
      'Content Posting API review/audit applies. Unaudited Direct Post clients have visibility and usage restrictions.',
    steps: [
      'Sign in to TikTok for Developers, complete developer onboarding and create an app for your organization or permitted developer account.',
      'Add Login Kit and Content Posting API. Configure the Web platform, app details, privacy policy, terms and required demonstration material.',
      'In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'Request video.publish for Direct Post, video.upload for upload flows and the user/profile/video scopes this connector needs. Apply for review and the publishing audit when required.',
      'Copy Client key and Client secret from the app’s basic information/credentials. TikTok calls this value Client key; SM-IT labels its field TIKTOK_CLIENT_ID.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      TIKTOK_CLIENT_ID:
        'TikTok Developers > app > Basic information > Client key.',
      TIKTOK_CLIENT_SECRET: 'Client secret for that same TikTok app.',
    },
    troubleshooting: [
      'URL-based uploads require verified domain/URL ownership and provider-accessible media.',
      'If publishing is private-only or limited, check the audit status; a valid key cannot remove those restrictions.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://developers.tiktok.com/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.tiktok.com/docs/getting-started-create-an-app',
      },
      {
        label: 'Direct Post requirements',
        url: 'https://developers.tiktok.com/docs/content-posting-api-get-started',
      },
    ],
    permissions: [
      'video.list',
      'user.info.basic',
      'video.publish',
      'video.upload',
      'user.info.profile',
      'user.info.stats',
    ],
  },
  'tiktok-business': {
    name: 'TikTok for Business',
    account:
      'An eligible TikTok for Business/Business Account and developer access for the Business API product used by this connector.',
    access:
      'Business API access and business-account posting permissions are separate from ordinary TikTok developer access.',
    steps: [
      'Open TikTok API for Business and complete developer registration for the business/organization.',
      'Create an app and apply for the relevant Business Account/organic publishing API access. Confirm that your app is eligible for the user and video posting scopes listed below; do not assume Marketing/Ads access grants organic publishing.',
      'Configure the app’s authorization redirect. Register the displayed callback exactly, including its trailing slash.',
      'Copy the app’s client key/ID and client secret into the Business-specific fields. Keep these separate from the ordinary TikTok connection.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Authorize the correct Business Account.',
    ],
    fields: {
      TIKTOK_BUSINESS_CLIENT_ID:
        'Client key/ID for the approved Business API application.',
      TIKTOK_BUSINESS_CLIENT_SECRET:
        'Client secret belonging to that Business API app.',
    },
    troubleshooting: [
      'If the portal issues credentials for a different API product or rejects these scopes, contact TikTok Business support to confirm compatibility before proceeding.',
      'App approval, media URL verification and posting limits still apply. This guide does not guarantee Business API eligibility.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://business-api.tiktok.com/portal/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://business-api.tiktok.com/portal/docs',
      },
    ],
    permissions: [
      'user.info.basic',
      'user.info.username',
      'user.info.stats',
      'video.list',
      'video.upload',
      'video.publish',
    ],
  },
  reddit: {
    name: 'Reddit',
    account: 'A Reddit account with approved external Data API access.',
    access:
      'Request explicit API approval under Reddit’s Responsible Builder Policy. Commercial use can require a separate agreement.',
    steps: [
      'Read Reddit’s Responsible Builder Policy and request approval for this external publishing integration. Devvit and the external Data API are different products.',
      'Once approved, use the app-registration path Reddit provides. If the legacy prefs/apps page is available for your approved account, create a Web app for OAuth redirects rather than a script-only app.',
      'In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'Copy the app’s client ID and client secret. On the legacy app card, the short value under the app name is the client ID. Use read, identity, submit and flair permissions for this connector.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
      'Choose a subreddit you can post to and check its posting rules, flair requirements and account eligibility.',
    ],
    fields: {
      REDDIT_CLIENT_ID:
        'Client ID of the approved web application; on the legacy app card it appears under the app name.',
      REDDIT_CLIENT_SECRET:
        'Secret shown in the same approved web app settings.',
    },
    troubleshooting: [
      'If app creation is unavailable, obtain Reddit approval instead of repeatedly creating accounts or trying other app types.',
      'Authorization does not override subreddit moderation or commercial API terms.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://www.reddit.com/prefs/apps',
      },
      {
        label: 'Official setup documentation',
        url: 'https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy',
      },
    ],
    permissions: ['read', 'identity', 'submit', 'flair'],
  },
  pinterest: {
    name: 'Pinterest',
    account: 'A Pinterest business account and developer app access.',
    access:
      'Trial and Standard API access have different limits. Approval is required for the relevant access tier.',
    steps: [
      'Sign in with a Pinterest business account and open Pinterest Developers > My apps.',
      'Create an app, describe your use case, and complete the website and policy information. Apply for Trial access if needed.',
      'In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'Request board read/write, pin read/write and user account read scopes. For broader customer use, request Standard access and provide Pinterest’s required review evidence.',
      'Copy App ID and App secret from the app credentials into the Client ID/secret fields here. Do not paste a short-lived developer test token.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Choose a board available to the authorized account.',
    ],
    fields: {
      PINTEREST_CLIENT_ID:
        'Pinterest Developers > My apps > your app > App ID.',
      PINTEREST_CLIENT_SECRET: 'App secret from that same Pinterest app.',
    },
    troubleshooting: [
      'A trial token or approved Trial app does not automatically authorize other customers.',
      'Check board ownership/permissions and the current access tier if Pin creation is denied.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://developers.pinterest.com/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developer.pinterest.com/docs/getting-started/connect-app/',
      },
    ],
    permissions: [
      'boards:read',
      'boards:write',
      'pins:read',
      'pins:write',
      'user_accounts:read',
    ],
  },
  discord: {
    name: 'Discord',
    account:
      'A Discord account and permission to add/manage apps in the target server.',
    access:
      'Use a bot app. Automating an ordinary user account with a user token is not supported.',
    steps: [
      'Open Discord Developer Portal > Applications > New Application. Name the app and open its settings.',
      'In OAuth2, copy Client ID and Client Secret and add the callback displayed below to Redirects.',
      'Open Bot and generate or reset the bot token. Keep it private; this is the third credential in the SM-IT form, not the OAuth client secret.',
      'Enable the app’s server/guild installation. Review the requested bot permissions for sending messages, viewing channels and attaching files in the target channels.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Select the server and allow the bot installation.',
      'Check that channel-level permission overrides allow the bot to send messages and media.',
    ],
    fields: {
      DISCORD_CLIENT_ID: 'Developer Portal > app > OAuth2 > Client ID.',
      DISCORD_CLIENT_SECRET: 'OAuth2 > Client Secret.',
      DISCORD_BOT_TOKEN_ID:
        'Bot > Token. Despite the field name, enter the complete bot token, not a bot ID.',
    },
    troubleshooting: [
      'The bot token must belong to the same application as the client ID; SM-IT checks that pairing.',
      'If installation or channel access is denied, check server permissions and bot role/channel overrides.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://discord.com/developers/applications',
      },
      {
        label: 'Official setup documentation',
        url: 'https://docs.discord.com/developers/topics/oauth2',
      },
    ],
    permissions: ['identify', 'guilds'],
  },
  slack: {
    name: 'Slack',
    account:
      'A Slack account in a workspace where you can install apps, or approval from a workspace admin.',
    access:
      'Workspace app policies may require admin approval. Wider distribution has separate Slack requirements.',
    steps: [
      'Open Slack’s app management page and create an app From scratch, selecting your development workspace.',
      'In Basic Information > App Credentials, copy Client ID and Client Secret.',
      'In OAuth & Permissions, register the callback below. Configure the bot scopes requested by this connector: channels:read, chat:write, users:read, groups:read, channels:join and chat:write.customize.',
      'If you will connect other workspaces, configure distribution and any approval requirements. For your own workspace, confirm the administrator permits this app.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
      'Invite the bot to the intended channel, especially private channels.',
    ],
    fields: {
      SLACK_ID: 'Slack app > Basic Information > App Credentials > Client ID.',
      SLACK_SECRET: 'Basic Information > App Credentials > Client Secret.',
    },
    troubleshooting: [
      'Paste Client ID/Client Secret here, not an xoxb bot token or an app-level xapp token.',
      'missing_scope needs the matching permission plus reinstallation/re-authorization; channel_not_found can mean the bot is not a member.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://api.slack.com/apps',
      },
      {
        label: 'Official setup documentation',
        url: 'https://docs.slack.dev/authentication/installing-with-oauth/',
      },
    ],
    permissions: [
      'channels:read',
      'chat:write',
      'users:read',
      'groups:read',
      'channels:join',
      'chat:write.customize',
    ],
  },
  twitch: {
    name: 'Twitch',
    account:
      'A verified Twitch account with two-factor authentication enabled.',
    access:
      'Chat and announcement actions depend on the signed-in account’s channel role and granted scopes.',
    steps: [
      'Sign in to Twitch Developer Console with the account that will own the app. Verify its email and enable 2FA.',
      'Open Applications > Register Your Application. Enter an app name, the appropriate category and the callback below.',
      'Use a confidential/server application when the dashboard offers a client type, because this connector uses a client secret.',
      'Open Manage for the app, copy Client ID and generate a New Secret. Replacing the secret can invalidate connections using the old one.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
      'For announcements, ensure the authorized account is permitted to moderate the target channel.',
    ],
    fields: {
      TWITCH_CLIENT_ID:
        'Twitch Developer Console > Applications > Manage > Client ID.',
      TWITCH_CLIENT_SECRET:
        'Manage > New Secret / Client Secret for the same application.',
    },
    troubleshooting: [
      'If no secret can be generated, check the app’s client type and account verification.',
      'A successful login alone does not grant moderator privileges in another channel.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://dev.twitch.tv/console/apps',
      },
      {
        label: 'Official setup documentation',
        url: 'https://dev.twitch.tv/docs/authentication/register-app',
      },
    ],
    permissions: [
      'user:write:chat',
      'user:read:chat',
      'moderator:manage:announcements',
    ],
  },
  kick: {
    name: 'Kick',
    account:
      'A Kick account with access to its developer application settings.',
    access:
      'Chat posting needs the chat:write permission and access to the target channel.',
    steps: [
      'Sign in to Kick and open the developer settings/app setup linked from KICK Dev. Complete any required account verification.',
      'Create a new app, enter its name, description and the website details requested by Kick.',
      'In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.',
      'Copy the generated Client ID and Client Secret. The connector requests user:read, channel:read and chat:write.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      KICK_CLIENT_ID:
        'Client ID generated when creating the Kick developer app.',
      KICK_SECRET: 'Client Secret from that same Kick app.',
    },
    troubleshooting: [
      'OAuth errors can result from a callback mismatch or missing app permissions.',
      'Check channel chat restrictions and the authorized account if login succeeds but sending a message is refused.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://dev.kick.com/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://github.com/KickEngineering/KickDevDocs/blob/main/getting-started/kick-apps-setup.md',
      },
    ],
    permissions: ['chat:write', 'user:read', 'channel:read'],
  },
  mastodon: {
    name: 'Mastodon',
    account:
      'An account on the Mastodon server configured for this installation.',
    access:
      'App credentials are specific to a server. This form uses MASTODON_URL if configured, otherwise mastodon.social.',
    steps: [
      'Sign in to your Mastodon server and open Preferences > Development > New application.',
      'Name the app SM-IT, register the callback below and select scopes that cover profile, write:statuses and write:media. Save the app.',
      'Open the new application and copy Client key and Client secret. Client key is the value SM-IT calls Client ID; do not use Your access token as the client ID.',
      'Confirm that the app was created on the same server as the installation’s configured Mastodon instance. If using another instance, have the installation owner align the server configuration first.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      MASTODON_CLIENT_ID:
        'Your Mastodon server > Preferences > Development > application > Client key.',
      MASTODON_CLIENT_SECRET:
        'Client secret on the same server/application details page.',
    },
    troubleshooting: [
      'A key from one server cannot authorize an account on a different server.',
      'If the server does not support profile scope, its version and this connector’s requested scopes need checking.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://docs.joinmastodon.org/client/intro/',
      },
    ],
    permissions: ['write:statuses', 'profile', 'write:media'],
  },
  dribbble: {
    name: 'Dribbble',
    account:
      'A Dribbble account permitted to upload shots, plus a registered OAuth application.',
    access:
      'The upload permission does not grant capabilities your Dribbble account does not already have.',
    steps: [
      'Sign in to Dribbble and open its developer application registration/settings.',
      'Register a new application with the app name, website and callback shown below.',
      'Copy the application’s Client ID and Client Secret. Configure/authorize public and upload scopes for this connector.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
      'Before scheduling, confirm that the account can upload the intended shot or attachment on Dribbble itself.',
    ],
    fields: {
      DRIBBBLE_CLIENT_ID:
        'Client ID issued when registering the Dribbble OAuth app.',
      DRIBBBLE_CLIENT_SECRET: 'Client secret belonging to that OAuth app.',
    },
    troubleshooting: [
      'A suspended application or unsupported upload permission requires Dribbble support; another secret will not grant access.',
      'This connector requires reconnection when Dribbble authorization expires.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://dribbble.com/account/applications',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developer.dribbble.com/v2/oauth/',
      },
    ],
    permissions: ['public', 'upload'],
  },
  tumblr: {
    name: 'Tumblr',
    account:
      'A Tumblr account with a blog it can publish to and a registered OAuth app.',
    access:
      'Use Tumblr’s OAuth 2.0 publishing flow with write and offline_access.',
    steps: [
      'Sign in to Tumblr, open application registration/manage apps, and register SM-IT with your app and website details.',
      'Set both the relevant callback/default callback and OAuth2 redirect setting to the callback shown here, as supported by the dashboard.',
      'Copy OAuth consumer key and secret from the application details. For this OAuth2 connector they serve as client ID and client secret.',
      'Ensure the application may request write and offline_access. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
      'Confirm the authorized account has publishing rights to the intended blog.',
    ],
    fields: {
      TUMBLR_CLIENT_ID:
        'The registered Tumblr application OAuth consumer key, used as the OAuth2 client ID.',
      TUMBLR_CLIENT_SECRET:
        'The same Tumblr application OAuth consumer secret.',
    },
    troubleshooting: [
      'redirect_uri_mismatch usually means the OAuth2 redirect entry differs from the callback used here.',
      'Do not substitute an OAuth1 user token/secret for the application credentials.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://www.tumblr.com/oauth/apps',
      },
      {
        label: 'Official setup documentation',
        url: 'https://github.com/tumblr/docs/blob/master/api.md',
      },
    ],
    permissions: ['write', 'offline_access'],
  },
  telegram: {
    name: 'Telegram',
    account:
      'A Telegram account and permission to add a bot to the target group or channel.',
    access:
      'No separate developer account or OAuth callback is needed. The bot needs posting rights in the destination.',
    steps: [
      'In Telegram, open the verified @BotFather account and send /newbot.',
      'Choose a display name and an available bot username as prompted. Copy the complete bot token BotFather returns.',
      'Paste that token below and choose Test and connect. SM-IT checks the bot and displays its username.',
      'Add that bot to the intended group or channel. For a channel, make it an administrator with permission to post messages and the relevant media.',
      'Follow the Telegram connection screen: start the connection and send the exact /connect command it displays into the destination chat. Wait for confirmation.',
    ],
    fields: {
      TELEGRAM_TOKEN: 'The complete token issued by @BotFather for your bot.',
    },
    troubleshooting: [
      'If the test cannot identify the bot, copy its current token again from BotFather.',
      'If no connection command is detected, check that you sent it in the correct group/channel and that the bot can read the command and post there.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://t.me/BotFather',
      },
      {
        label: 'Official setup documentation',
        url: 'https://core.telegram.org/bots/features#botfather',
      },
    ],
    permissions: [],
  },
  wrapcast: {
    name: 'Farcaster',
    account:
      'A Farcaster developer/app account and a Neynar developer account.',
    access:
      'Neynar API access and signer registration can involve plan usage or on-chain fees. The app account’s wallet phrase is sensitive.',
    steps: [
      'Sign in to the Neynar developer dashboard and obtain an API key for the application/account with managed-signer access.',
      'Create or select a dedicated Farcaster account representing your app. Find that account’s numeric FID in its account information or through Neynar’s user lookup.',
      'Obtain the recovery phrase of that app account’s custody wallet using the wallet/account’s own recovery/export procedure. It must correspond to the app FID. Never use the recovery phrase of the person connecting their personal account.',
      'Enter the Neynar API key, app FID and app wallet phrase in this local SM-IT setup. Choose Test and connect; SM-IT creates a signer request signed by the app account.',
      'Scan the QR code or open the approval link in the Farcaster client. Review the app requesting access, approve the signer and complete any displayed registration fee step. Wait for the connection to finish.',
    ],
    fields: {
      NEYNAR_SECRET_KEY: 'Neynar developer dashboard > API key.',
      NEYNAR_APP_FID: 'Numeric Farcaster ID of the app/developer account.',
      NEYNAR_APP_MNEMONIC:
        'Recovery phrase for that app account’s custody wallet, not a connecting user’s wallet.',
    },
    troubleshooting: [
      'A signature or registration failure can indicate that the phrase does not control the app FID’s custody wallet.',
      'If the approval is revoked, expires or never completes, start a new test. A signer from a different test is not accepted.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://dev.neynar.com/',
      },
      {
        label: 'Official setup documentation',
        url: 'https://docs.neynar.com/docs/integrate-managed-signers',
      },
    ],
    permissions: [],
  },
  mewe: {
    name: 'MeWe',
    account: 'A MeWe account approved for the MeWe Developer Program preview.',
    access:
      'Developer access is an approval-based preview with limited availability.',
    steps: [
      'Sign in at MeWe developer settings and apply to the Developer Program. Wait for approval before attempting app creation.',
      'Create a new application in developer settings. Choose the supported standalone/web integration and the permissions needed for your publishing use case.',
      'Set its application/return URL as required by MeWe’s authentication guide using the callback shown here. Complete any additional app settings required by your approved preview.',
      'Copy the application ID and API key from the application settings into the corresponding fields below.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Approve the MeWe login request if prompted.',
    ],
    fields: {
      MEWE_APP_ID: 'Developer settings > your application > application ID.',
      MEWE_API_KEY: 'API key issued for the same approved application.',
    },
    troubleshooting: [
      'No developer settings or no create-app option usually means access has not been granted yet.',
      'A pending login request must be approved in MeWe; retry if the request has expired.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://developer.mewe.com/developer',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developer.mewe.com/quickstart',
      },
      {
        label: 'MeWe authentication flow',
        url: 'https://developer.mewe.com/authentication',
      },
    ],
    permissions: [],
  },
  vk: {
    name: 'VK',
    account:
      'A VK ID account and an application registered in the VK ID connection dashboard.',
    access:
      'App eligibility and available VK posting permissions depend on the application type and VK approval.',
    steps: [
      'Sign in to the VK ID application dashboard linked by the official SDK documentation, and create a web application.',
      'Enter the site/base domain and the authorized redirect/callback shown below. Complete the required app information.',
      'Copy the numeric application ID (client ID). This connector uses PKCE and exposes only the VK_ID field; it does not ask for your VK password or a service token.',
      'Confirm that the app can request the VK ID/profile and wall/media permissions shown below. If the dashboard cannot grant the publishing scopes, request VK support/approval.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
    ],
    fields: {
      VK_ID:
        'Numeric application/client ID from the VK ID web application dashboard.',
    },
    troubleshooting: [
      'A base-domain or redirect error needs both the site domain and callback settings checked.',
      'If VK refuses wall/media scopes for your app type, creating another ID cannot add them.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://github.com/VKCOM/vkid-web-sdk',
      },
    ],
    permissions: [
      'vkid.personal_info',
      'email',
      'wall',
      'status',
      'docs',
      'photos',
      'video',
    ],
  },
  whop: {
    name: 'Whop',
    account:
      'A Whop account with an app and access to the community/forum you want to post in.',
    access:
      'The connector uses a client-ID/PKCE flow. Confirm that your Whop app supports the requested forum permissions.',
    steps: [
      'Sign in to the Whop developer dashboard and create or select the app that will represent SM-IT.',
      'Open the app’s OAuth/authentication settings, enable the supported authorization flow and register the callback shown below.',
      'Copy the app’s OAuth client ID into WHOP_CLIENT_ID. This connector has no client-secret field; do not paste a Whop API key here.',
      'Confirm that openid, profile, email and the forum/company permissions requested by this connector are available to your app. Consult Whop’s current developer documentation or support if the dashboard differs.',
      'Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.',
      'Select or configure a forum/community that the authorized account can access and post to.',
    ],
    fields: {
      WHOP_CLIENT_ID:
        'OAuth client ID from your Whop application authentication settings; not a Whop API key.',
    },
    troubleshooting: [
      'If your app requires client-secret authentication, it may not be compatible with the current client-ID-only connector.',
      'Check the member’s community access and granted forum scopes if publishing is denied.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://docs.whop.com/',
      },
    ],
    permissions: [
      'openid',
      'profile',
      'email',
      'forum:post:create',
      'forum:read',
      'company:basic:read',
    ],
  },
  bluesky: {
    name: 'Bluesky',
    account:
      'A Bluesky account on bsky.social or another compatible personal data server.',
    access: 'No developer app is needed for this app-password connector.',
    steps: [
      'Sign in to Bluesky and open Settings > Privacy and Security > App Passwords (the menu grouping can vary by client).',
      'Create an app password named SM-IT and copy it when displayed.',
      'In SM-IT’s Bluesky form, use your server URL (normally https://bsky.social), your full account handle and the generated app password.',
      'Choose Connect and wait for the account profile to be verified. Use a revocable app password rather than your main Bluesky password.',
    ],
    fields: {},
    troubleshooting: [
      'Use the full handle, such as name.bsky.social, and the server that actually hosts the account.',
      'If the app password was revoked, create a replacement and reconnect.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://bsky.app/settings/app-passwords',
      },
      {
        label: 'Official setup documentation',
        url: 'https://bsky.social/about/blog/5-19-2023-user-faq',
      },
    ],
    permissions: ['write:statuses', 'profile', 'write:media'],
  },
  devto: {
    name: 'DEV.to',
    account: 'A DEV.to account that can publish articles.',
    access: 'No separate OAuth developer app is needed.',
    steps: [
      'Sign in to DEV.to and open Settings > Extensions.',
      'Under DEV Community API Keys, add a descriptive name such as SM-IT and generate a key.',
      'Copy the generated API key into the DEV.to API key field in SM-IT.',
      'Choose Connect and wait for account verification. When composing an article, choose a publication/organization only if the account is authorized to publish there.',
    ],
    fields: {},
    troubleshooting: [
      'If the account cannot be verified, check that the key is active and was generated for the intended DEV.to account.',
    ],
    links: [
      {
        label: 'Open account / developer settings',
        url: 'https://dev.to/settings/extensions',
      },
      {
        label: 'Official setup documentation',
        url: 'https://developers.forem.com/api',
      },
    ],
    permissions: [],
  },
  hashnode: {
    name: 'Hashnode',
    account:
      'A Hashnode account with a publication or rights to publish to one.',
    access:
      'Uses an account personal access token rather than an OAuth developer app.',
    steps: [
      'Sign in to Hashnode and open account/developer settings. Find Developer settings > Access tokens or Personal access tokens.',
      'Generate a personal access token for SM-IT and copy it when displayed.',
      'Paste it into the Hashnode API key field and choose Connect.',
      'Confirm that the connected account has access to the publication you select when composing a post. If access-token settings have moved, follow Hashnode’s current developer documentation.',
    ],
    fields: {},
    troubleshooting: [
      'A valid token does not give access to another owner’s publication; check publication membership and publishing permissions.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://docs.hashnode.com/',
      },
    ],
    permissions: [],
  },
  medium: {
    name: 'Medium',
    account:
      'An existing Medium integration token issued before Medium stopped creating new integrations.',
    access:
      'New integration tokens and new integrations are no longer offered by Medium. New users may not be able to connect this API connector.',
    steps: [
      'Check Medium’s API/Importing notice before attempting setup. There is no current self-service procedure here to create a new integration token.',
      'If you already have an integration token, confirm with Medium that it is still allowed and usable for your existing integration.',
      'Paste only that existing token into the API key field and choose Connect. This connector cannot create or restore a discontinued token.',
      'If you do not have a usable token, publish using Medium’s website instead; do not substitute a password or browser cookie.',
    ],
    fields: {},
    troubleshooting: [
      'A missing token-generation section is expected for new integrations, not a missing SM-IT setting.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://help.medium.com/hc/en-us/articles/213480228-API-Importing',
      },
    ],
    permissions: [],
  },
  wordpress: {
    name: 'WordPress',
    account:
      'A WordPress site where your user can publish posts and upload media.',
    access:
      'Uses a per-user Application Password. The site must expose the WordPress REST API and accept authenticated requests.',
    steps: [
      'Sign in to the target site’s wp-admin as the user who will publish. Open Users > Profile.',
      'Find Application Passwords, name a new password SM-IT, generate it and copy it immediately.',
      'In SM-IT, enter the site’s base URL (for example https://example.com), that WordPress username and the generated Application Password.',
      'Choose Connect. Check the account role permits post publishing and media uploads. This is the self-hosted WordPress REST API flow, not a WordPress.com OAuth client.',
    ],
    fields: {},
    troubleshooting: [
      'If Application Passwords is missing, check HTTPS support and site security policies with the administrator.',
      '401/403 can indicate a wrong username, revoked Application Password or a proxy/security plugin blocking REST authentication.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://developer.wordpress.org/advanced-administration/security/application-passwords/',
      },
    ],
    permissions: [],
  },
  listmonk: {
    name: 'listmonk',
    account:
      'Access to a listmonk installation with configured email sending and an authorized API user.',
    access:
      'Self-hosted newsletter publishing; sending also depends on your SMTP/email provider and list permissions.',
    steps: [
      'Sign in to listmonk as an administrator and configure the email sender/SMTP settings and subscriber lists if this has not been done.',
      'Open the user management settings and create an API user with access to the target lists, templates/media and the campaign operations needed for publishing, including sending campaigns.',
      'Copy the API user’s generated secret token. In SM-IT, enter the listmonk base URL, API username and this token in the Password field.',
      'Choose Connect. Before using a live subscriber list, verify your sender setup and campaign permissions with a test list.',
    ],
    fields: {},
    troubleshooting: [
      'The form’s Password field accepts the API user’s secret token; it is not an OAuth app secret.',
      'An authenticated API user can still lack campaign-send or list-specific permissions.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://listmonk.app/docs/roles-and-permissions/',
      },
    ],
    permissions: [],
  },
  lemmy: {
    name: 'Lemmy',
    account:
      'An approved account on a Lemmy instance where you are allowed to post.',
    access:
      'No developer app or global API key is needed. Instance and community rules apply.',
    steps: [
      'Choose a Lemmy instance and create an account there. Complete email verification or manual approval if the instance requires it.',
      'In the Lemmy form, enter the instance base URL, your username on that instance and its account password.',
      'Choose Connect and wait for the account check. If using an automated publishing account, enable its Bot Account setting where appropriate.',
      'Choose communities available through that instance and follow their posting rules.',
    ],
    fields: {},
    troubleshooting: [
      'The username and password must belong to the selected instance, not a similarly named account on another instance.',
      'Accounts requiring a login flow this connector does not support may fail even with a correct password.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://join-lemmy.org/docs/users/01-getting-started.html',
      },
    ],
    permissions: [],
  },
  nostr: {
    name: 'Nostr',
    account:
      'A Nostr signing identity you control and access to the relays used by this connector.',
    access:
      'A private signing key is the credential; there is no central developer account or OAuth app.',
    steps: [
      'Create a separate publishing identity in a trusted Nostr client/wallet that supports key export.',
      'Back up its private key using that client’s procedure. This connector accepts the private key format implemented by SM-IT; it does not use a browser-extension signer approval flow.',
      'Enter the raw 64-character hexadecimal private signing key in the Nostr private key field and choose Connect. This connector does not decode an nsec-formatted key; use your trusted client’s supported export procedure to obtain the hexadecimal representation.',
      'Check that the relays used for the identity accept your signed events. A relay may apply its own access or posting limits.',
    ],
    fields: {},
    troubleshooting: [
      'Never paste the public npub key where a private key is required.',
      'A private key grants signing control of the identity. Use an identity dedicated to this installation.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://github.com/nostr-protocol/nips/blob/master/01.md',
      },
    ],
    permissions: [],
  },
  moltbook: {
    name: 'Moltbook',
    account:
      'An agent account/API key and access to complete the provider’s ownership-claim procedure.',
    access:
      'Uses the agent registration/claim flow implemented by this connector. Confirm current provider availability before relying on it.',
    steps: [
      'Open the Moltbook channel flow in SM-IT. If you already have a claimed agent, enter its API key in the existing-agent option.',
      'Otherwise, use the registration option to supply an agent name and description. Keep the returned API key private.',
      'Open the returned claim URL on Moltbook and complete the ownership verification requested by the provider.',
      'Return to SM-IT and check the claim status. Finish connecting only after the agent is confirmed as claimed.',
    ],
    fields: {},
    troubleshooting: [
      'An unclaimed agent may not have posting access. Follow the exact current claim instructions on the returned provider page.',
      'If registration is unavailable, check the provider’s status/documentation instead of generating unrelated API credentials.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://www.moltbook.com/',
      },
    ],
    permissions: [],
  },
  skool: {
    name: 'Skool',
    account:
      'A Skool account with access to the target community and the SM-IT browser extension.',
    access:
      'This connector uses a browser session, not an official developer API key. It can stop working when the platform or session changes.',
    steps: [
      'Sign in to Skool in the browser where the SM-IT extension is installed. Confirm you can post in the target group.',
      'Follow SM-IT’s browser-extension setup instructions if it is not installed; the project’s extension build/setup is separate from creating a social developer account.',
      'Choose Skool in Add Channel and read the session-access notice. Continue only if you accept that connection method.',
      'Allow the installed extension to provide the required Skool session to this local app, then complete the connection. No Skool client ID or developer key is requested by this connector.',
    ],
    fields: {},
    troubleshooting: [
      'Logging out, session expiry or Skool changes can require reconnecting.',
      'Skool’s separate official integrations do not automatically make this browser-session connector an official API integration.',
    ],
    links: [
      {
        label: 'Official setup documentation',
        url: 'https://help.skool.com/',
      },
    ],
    permissions: [],
  },
};

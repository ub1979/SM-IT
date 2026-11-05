# Connect social channels to SM-IT

Setup reference • 5 November 2026

Open **Calendar > Add Channel**, choose a platform, then expand **Step-by-step setup guide**. The guide covers account eligibility, app creation, where each credential comes from, consent, reviews and common failures. Account-token platforms show the guide beside their connection form.

## Before you begin

- Use the exact callback displayed by your running installation. Do not replace it with a URL copied from an example. Register each platform callback separately. A callback is the return address after platform sign-in, not your homepage.
- Enter app credentials in SM-IT and choose **Test and connect**. They stay temporary until the platform verifies authorization, then SM-IT saves them to the local `.env`. A failed or abandoned test does not overwrite the saved app credentials. Account-specific tokens/passwords are stored with their channel, not as global app credentials.
- App review, developer approval, paid API access, upload audits and media-hosting requirements are separate from a successful connection. Check each platform’s current terms and pricing; SM-IT does not grant access on the provider’s behalf.
- Some existing connectors use an HTTPS redirect relay for local callbacks. Copy the displayed URL exactly, but do not assume a relay satisfies a provider’s HTTPS/domain requirements. If the provider refuses the local setup, use a separately secured callback/media configuration. This local owner-only installation is not ready to expose publicly.
- Keep credentials private. Never put them in screenshots, Git commits or support messages. Use a dedicated app/account where practical. Rotating shared app credentials can require reconnecting channels.

## Platforms

- [YouTube](#youtube)
- [Google Business Profile](#gmb)
- [X](#x)
- [LinkedIn profile](#linkedin)
- [LinkedIn Page](#linkedin-page)
- [Facebook Page](#facebook)
- [Instagram via Facebook](#instagram)
- [Instagram with Instagram Login](#instagram-standalone)
- [Threads](#threads)
- [TikTok](#tiktok)
- [TikTok for Business](#tiktok-business)
- [Reddit](#reddit)
- [Pinterest](#pinterest)
- [Discord](#discord)
- [Slack](#slack)
- [Twitch](#twitch)
- [Kick](#kick)
- [Mastodon](#mastodon)
- [Dribbble](#dribbble)
- [Tumblr](#tumblr)
- [Telegram](#telegram)
- [Farcaster](#wrapcast)
- [MeWe](#mewe)
- [VK](#vk)
- [Whop](#whop)
- [Bluesky](#bluesky)
- [DEV.to](#devto)
- [Hashnode](#hashnode)
- [Medium](#medium)
- [WordPress](#wordpress)
- [listmonk](#listmonk)
- [Lemmy](#lemmy)
- [Nostr](#nostr)
- [Moltbook](#moltbook)
- [Skool](#skool)

<a id="youtube"></a>
## YouTube

**Account needed:** A Google account with a YouTube channel you can manage.

**Access and limitations:** OAuth verification and YouTube upload audits are separate. Testing apps have restrictions; unaudited uploads can be limited to private visibility.

1. Open Google Cloud Console, sign in, and create or select a project for SM-IT.
2. In APIs & Services > Library, enable YouTube Data API v3 and YouTube Analytics API.
3. Open Google Auth Platform. Set up Branding, Audience and Data Access for your app. For external testing, add the Google account you will connect as a test user.
4. In Clients (or APIs & Services > Credentials), create an OAuth client ID with application type Web application. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
5. Copy that client’s Client ID and Client secret. A Google API key or a service-account JSON file cannot replace this pair.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`YOUTUBE_CLIENT_ID`:** Google Auth Platform > Clients > your Web application > Client ID.
- **`YOUTUBE_CLIENT_SECRET`:** The Client secret belonging to the same Google OAuth client.

**Permissions requested by the current SM-IT connector:** `https://www.googleapis.com/auth/userinfo.profile`, `https://www.googleapis.com/auth/userinfo.email`, `https://www.googleapis.com/auth/youtube`, `https://www.googleapis.com/auth/youtube.force-ssl`, `https://www.googleapis.com/auth/youtube.readonly`, `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtubepartner`, `https://www.googleapis.com/auth/yt-analytics.readonly`.

### If connection fails

- redirect_uri_mismatch: compare the registered redirect URI with the URL below character for character.
- access_denied: check your test-user list, app audience and granted scopes. SM-IT currently also requests youtubepartner; restricted or unsupported scopes may require provider approval or a connector update.
- A successful login does not certify public uploads. Check YouTube API quota and upload audit requirements before scheduling.

**Official references:** [Open account / developer settings](https://console.cloud.google.com/), [Official setup documentation](https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps), [YouTube upload restrictions and audits](https://developers.google.com/youtube/v3/docs/videos/insert).

<a id="gmb"></a>
## Google Business Profile

**Account needed:** An owner or manager of an eligible, verified business profile, plus a Google Cloud project.

**Access and limitations:** Google must approve the Cloud project for Business Profile API access. Creating an OAuth client alone does not grant access.

1. Sign in to Google Business Profile and confirm that your account can manage the location you want to connect.
2. Create or select a Google Cloud project. Use its project number to submit the Business Profile API access request described in the official prerequisites. Wait for approval.
3. Enable the Business Profile APIs needed by the connector, including Account Management, Business Information, Performance and Google My Business (for local posts). Follow Google’s basic setup list.
4. Configure Google Auth Platform branding, audience and the business.manage permission. Add your account as a test user if the app is in external testing.
5. Create a Web application OAuth client. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings. Copy its Client ID and Client secret into the fields shown here. This installation may use the existing YouTube pair as a fallback.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`GOOGLE_GMB_CLIENT_ID`:** Google Auth Platform > Clients > Web application > Client ID.
- **`GOOGLE_GMB_CLIENT_SECRET`:** Client secret of that Google Web application.
- **`YOUTUBE_CLIENT_ID`:** This installation currently falls back to the saved Google/YouTube Web client ID. Register the Business Profile callback on that client too.
- **`YOUTUBE_CLIENT_SECRET`:** Client secret of the same fallback Google Web application.

**Permissions requested by the current SM-IT connector:** `https://www.googleapis.com/auth/userinfo.profile`, `https://www.googleapis.com/auth/userinfo.email`, `https://www.googleapis.com/auth/business.manage`.

### If connection fails

- A zero API quota commonly indicates that the project has not been approved.
- An empty location list can mean that the signed-in Google account does not manage the business or that an API is not enabled.

**Official references:** [Open account / developer settings](https://console.cloud.google.com/), [Official setup documentation](https://developers.google.com/my-business/content/prereqs), [Google Business API setup](https://developers.google.com/my-business/content/basic-setup).

<a id="x"></a>
## X

**Account needed:** An X account and approved access to the X Developer Console.

**Access and limitations:** Posting needs suitable API access and available credits or a paid agreement. Check the current console pricing before enabling automation.

1. Sign in to the X Developer Console, complete developer onboarding and describe your publishing use case.
2. Create an app for SM-IT and open its user authentication settings. This connector uses OAuth 1.0a.
3. Set app permissions to Read and write. Enter the app website and any required application information. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
4. In Keys and tokens, generate or reveal API Key and API Key Secret. Use this OAuth 1.0a pair; do not paste an OAuth 2.0 Client ID, bearer token or user access token in these fields.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`X_API_KEY`:** Developer Console > app > Keys and tokens > API Key (OAuth 1.0a).
- **`X_API_SECRET`:** API Key Secret for the same app.

### If connection fails

- If X refuses localhost, its current guide specifies 127.0.0.1 for local callbacks. Ask the installation owner to align SM-IT’s X callback base (X_URL) with the accepted address, then register the newly displayed callback.
- A permission or API-access error after login can reflect the app’s access tier, credit balance, or compatibility of this OAuth 1.0a connector with the enabled endpoints. Reconnect after changing app permissions.

**Official references:** [Open account / developer settings](https://console.x.com/), [Official setup documentation](https://docs.x.com/fundamentals/developer-apps).

<a id="linkedin"></a>
## LinkedIn profile

**Account needed:** A LinkedIn member account and an app associated with a LinkedIn Page you can verify.

**Access and limitations:** Personal publishing uses the Share on LinkedIn product. Company Page publishing uses the separate LinkedIn Page connection.

1. Sign in at LinkedIn Developers > My apps > Create app. Supply the app name, associated LinkedIn Page, logo and required legal details.
2. Complete app/Page verification with the Page administrator if LinkedIn requests it.
3. In Products, enable or request Share on LinkedIn and Sign In with LinkedIn using OpenID Connect. Confirm access is granted.
4. In Auth, add the callback shown below to Authorized redirect URLs. Copy Client ID and reveal Client Secret.
5. Confirm the app can request openid, profile and w_member_social. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`LINKEDIN_CLIENT_ID`:** LinkedIn Developers > your app > Auth > Client ID.
- **`LINKEDIN_CLIENT_SECRET`:** Auth > Client Secret, revealed for that same app.

**Permissions requested by the current SM-IT connector:** `openid`, `profile`, `w_member_social`.

### If connection fails

- Invalid scope: the required product may still be pending or unavailable for the app.
- This choice publishes as a member profile. Choose LinkedIn Page if you want to publish as a company.

**Official references:** [Open account / developer settings](https://www.linkedin.com/developers/apps), [Official setup documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access).

<a id="linkedin-page"></a>
## LinkedIn Page

**Account needed:** A LinkedIn Page administrator and an eligible LinkedIn developer app.

**Access and limitations:** Community Management access is reviewed by LinkedIn; ordinary Share on LinkedIn access is insufficient for organization posting.

1. Create a LinkedIn app associated with the company Page and complete its app verification.
2. Request the Community Management product and the appropriate access tier. Provide the use case and any evidence LinkedIn asks for, then wait for approval.
3. Confirm the granted permissions cover organization administration, organization posting and reading organization content. This connector also requests member sign-in and publishing scopes.
4. In Auth, register this LinkedIn Page callback separately from the personal-profile callback. Copy the app Client ID and Client Secret.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.
6. After authorization, select the company Page you administer and finish connecting it.

### Where to find the fields

- **`LINKEDIN_CLIENT_ID`:** LinkedIn Developers > your app > Auth > Client ID.
- **`LINKEDIN_CLIENT_SECRET`:** Auth > Client Secret, revealed for that same app.

**Permissions requested by the current SM-IT connector:** `openid`, `profile`, `w_member_social`, `rw_organization_admin`, `w_organization_social`, `r_organization_social`.

### If connection fails

- A missing organization scope needs product approval; generating another secret cannot add that permission.
- If the Page is missing, verify the signed-in member’s Page admin role. LinkedIn profile and Page connections share the installation’s LinkedIn app credentials.

**Official references:** [Open account / developer settings](https://www.linkedin.com/developers/apps), [Official setup documentation](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-api/overview).

<a id="facebook"></a>
## Facebook Page

**Account needed:** A Facebook account with sufficient access to a Facebook Page and a Meta developer account.

**Access and limitations:** Page publishing, not personal Facebook profile posting. App review may be needed for accounts outside your app roles.

1. Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.
2. Configure Facebook Login for the app and enter the website and required app details. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
3. Enable the Page permissions requested by SM-IT, including pages_show_list, pages_manage_posts, pages_read_engagement and the additional management/insights permissions listed below.
4. In App settings > Basic, copy App ID and reveal App Secret. These are the Meta app credentials, not a temporary Page access token.
5. In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Select the Page you intend to publish to.

### Where to find the fields

- **`FACEBOOK_APP_ID`:** Meta app dashboard > App settings > Basic > App ID.
- **`FACEBOOK_APP_SECRET`:** App settings > Basic > App Secret.

**Permissions requested by the current SM-IT connector:** `pages_show_list`, `business_management`, `pages_manage_posts`, `pages_manage_engagement`, `pages_read_engagement`, `read_insights`.

### If connection fails

- No Pages listed: check your Page access and grant access to the Page in the Facebook consent screen.
- A permission being visible in a dashboard does not mean it has advanced access. Check App Review > Permissions and Features.

**Official references:** [Open account / developer settings](https://developers.facebook.com/apps/), [Official setup documentation](https://developers.facebook.com/docs/pages-api/getting-started/).

<a id="instagram"></a>
## Instagram via Facebook

**Account needed:** An Instagram professional account connected to a Facebook Page, and access to manage that Page.

**Access and limitations:** Personal Instagram accounts are not supported by this API route. Meta review may be needed beyond app-role accounts.

1. Change the Instagram account to a professional account if necessary, and link it to a Facebook Page you manage.
2. Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.
3. Configure Instagram API with Facebook Login and its Facebook Login settings. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
4. Enable instagram_basic, instagram_content_publish and the Page, insights and comment permissions that this connector requests. In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.
5. Copy the Meta app App ID and App Secret from App settings > Basic. These fields are shared with the Facebook Page connection.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Select the Page/Instagram account when prompted.

### Where to find the fields

- **`FACEBOOK_APP_ID`:** Meta app dashboard > App settings > Basic > App ID.
- **`FACEBOOK_APP_SECRET`:** App settings > Basic > App Secret.

**Permissions requested by the current SM-IT connector:** `instagram_basic`, `pages_show_list`, `pages_read_engagement`, `business_management`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`.

### If connection fails

- An empty account list often means the Instagram account is not professional or is not linked to the authorized Page.
- Media must satisfy Instagram’s publishing rules and be reachable by Meta; a local-only media URL cannot be fetched by Meta.

**Official references:** [Open account / developer settings](https://developers.facebook.com/apps/), [Official setup documentation](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/).

<a id="instagram-standalone"></a>
## Instagram with Instagram Login

**Account needed:** An Instagram Business or Creator account and a Meta developer app configured for Instagram Login.

**Access and limitations:** This route uses Instagram app credentials and professional accounts; it does not require linking a Facebook Page.

1. Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.
2. Choose Instagram API with Instagram Login. Set up the app and add the Instagram professional account as a tester when developing.
3. Register the callback displayed below in the Instagram login settings. Accept any tester invitation in the Instagram account.
4. Enable instagram_business_basic, instagram_business_content_publish and the comments/insights permissions requested by this connector. In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.
5. Copy the Instagram App ID and Instagram App Secret shown in the Instagram product setup. These are distinct from the Facebook credentials used by the other Instagram connection.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`INSTAGRAM_APP_ID`:** Instagram product > API setup with Instagram Login > Instagram App ID.
- **`INSTAGRAM_APP_SECRET`:** The Instagram App Secret from the same Instagram product setup.

**Permissions requested by the current SM-IT connector:** `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`, `instagram_business_manage_insights`.

### If connection fails

- Do not use a personal Instagram account or paste the Facebook app pair into the Instagram-specific fields.
- For local installations, the current connector may display a redirect relay URL. Register the displayed URL exactly; if the provider rejects it, a separately secured HTTPS callback setup is required.

**Official references:** [Open account / developer settings](https://developers.facebook.com/apps/), [Official setup documentation](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started).

<a id="threads"></a>
## Threads

**Account needed:** A Threads profile and a Meta developer account.

**Access and limitations:** App-role/tester accounts can test; connecting other users can require reviewed permissions.

1. Create or sign in to a Meta developer account at Meta for Developers. Complete any account verification, then create an app with the use case/product appropriate to this connection.
2. Select the Threads API use case/product. Configure the app’s website, privacy policy and other required information.
3. In the Threads settings, add the callback below and add your Threads account as a tester. Accept the tester invitation in the account if required.
4. Enable threads_basic and threads_content_publish, plus the reply, insights and discovery scopes requested by this connector.
5. Copy the Threads App ID and Threads App Secret from the Threads API setup. In development mode, use accounts with app roles/tester access. To connect people outside those roles, request the required advanced permissions and complete Meta’s app review or business verification where required.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`THREADS_APP_ID`:** Meta dashboard > Threads API use case/settings > Threads App ID.
- **`THREADS_APP_SECRET`:** Threads App Secret from that same Threads setup.

**Permissions requested by the current SM-IT connector:** `threads_basic`, `threads_content_publish`, `threads_manage_replies`, `threads_manage_insights`, `threads_profile_discovery`.

### If connection fails

- If authorization fails in development mode, check that the Threads tester invitation has been accepted.
- Publishing media requires URLs that Threads can retrieve, not local filesystem paths.

**Official references:** [Open account / developer settings](https://developers.facebook.com/apps/), [Official setup documentation](https://developers.facebook.com/docs/threads/get-started).

<a id="tiktok"></a>
## TikTok

**Account needed:** A TikTok account and a TikTok for Developers account.

**Access and limitations:** Content Posting API review/audit applies. Unaudited Direct Post clients have visibility and usage restrictions.

1. Sign in to TikTok for Developers, complete developer onboarding and create an app for your organization or permitted developer account.
2. Add Login Kit and Content Posting API. Configure the Web platform, app details, privacy policy, terms and required demonstration material.
3. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
4. Request video.publish for Direct Post, video.upload for upload flows and the user/profile/video scopes this connector needs. Apply for review and the publishing audit when required.
5. Copy Client key and Client secret from the app’s basic information/credentials. TikTok calls this value Client key; SM-IT labels its field TIKTOK_CLIENT_ID.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`TIKTOK_CLIENT_ID`:** TikTok Developers > app > Basic information > Client key.
- **`TIKTOK_CLIENT_SECRET`:** Client secret for that same TikTok app.

**Permissions requested by the current SM-IT connector:** `video.list`, `user.info.basic`, `video.publish`, `video.upload`, `user.info.profile`, `user.info.stats`.

### If connection fails

- URL-based uploads require verified domain/URL ownership and provider-accessible media.
- If publishing is private-only or limited, check the audit status; a valid key cannot remove those restrictions.

**Official references:** [Open account / developer settings](https://developers.tiktok.com/), [Official setup documentation](https://developers.tiktok.com/docs/getting-started-create-an-app), [Direct Post requirements](https://developers.tiktok.com/docs/content-posting-api-get-started).

<a id="tiktok-business"></a>
## TikTok for Business

**Account needed:** An eligible TikTok for Business/Business Account and developer access for the Business API product used by this connector.

**Access and limitations:** Business API access and business-account posting permissions are separate from ordinary TikTok developer access.

1. Open TikTok API for Business and complete developer registration for the business/organization.
2. Create an app and apply for the relevant Business Account/organic publishing API access. Confirm that your app is eligible for the user and video posting scopes listed below; do not assume Marketing/Ads access grants organic publishing.
3. Configure the app’s authorization redirect. Register the displayed callback exactly, including its trailing slash.
4. Copy the app’s client key/ID and client secret into the Business-specific fields. Keep these separate from the ordinary TikTok connection.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Authorize the correct Business Account.

### Where to find the fields

- **`TIKTOK_BUSINESS_CLIENT_ID`:** Client key/ID for the approved Business API application.
- **`TIKTOK_BUSINESS_CLIENT_SECRET`:** Client secret belonging to that Business API app.

**Permissions requested by the current SM-IT connector:** `user.info.basic`, `user.info.username`, `user.info.stats`, `video.list`, `video.upload`, `video.publish`.

### If connection fails

- If the portal issues credentials for a different API product or rejects these scopes, contact TikTok Business support to confirm compatibility before proceeding.
- App approval, media URL verification and posting limits still apply. This guide does not guarantee Business API eligibility.

**Official references:** [Open account / developer settings](https://business-api.tiktok.com/portal/), [Official setup documentation](https://business-api.tiktok.com/portal/docs).

<a id="reddit"></a>
## Reddit

**Account needed:** A Reddit account with approved external Data API access.

**Access and limitations:** Request explicit API approval under Reddit’s Responsible Builder Policy. Commercial use can require a separate agreement.

1. Read Reddit’s Responsible Builder Policy and request approval for this external publishing integration. Devvit and the external Data API are different products.
2. Once approved, use the app-registration path Reddit provides. If the legacy prefs/apps page is available for your approved account, create a Web app for OAuth redirects rather than a script-only app.
3. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
4. Copy the app’s client ID and client secret. On the legacy app card, the short value under the app name is the client ID. Use read, identity, submit and flair permissions for this connector.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.
6. Choose a subreddit you can post to and check its posting rules, flair requirements and account eligibility.

### Where to find the fields

- **`REDDIT_CLIENT_ID`:** Client ID of the approved web application; on the legacy app card it appears under the app name.
- **`REDDIT_CLIENT_SECRET`:** Secret shown in the same approved web app settings.

**Permissions requested by the current SM-IT connector:** `read`, `identity`, `submit`, `flair`.

### If connection fails

- If app creation is unavailable, obtain Reddit approval instead of repeatedly creating accounts or trying other app types.
- Authorization does not override subreddit moderation or commercial API terms.

**Official references:** [Open account / developer settings](https://www.reddit.com/prefs/apps), [Official setup documentation](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy).

<a id="pinterest"></a>
## Pinterest

**Account needed:** A Pinterest business account and developer app access.

**Access and limitations:** Trial and Standard API access have different limits. Approval is required for the relevant access tier.

1. Sign in with a Pinterest business account and open Pinterest Developers > My apps.
2. Create an app, describe your use case, and complete the website and policy information. Apply for Trial access if needed.
3. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
4. Request board read/write, pin read/write and user account read scopes. For broader customer use, request Standard access and provide Pinterest’s required review evidence.
5. Copy App ID and App secret from the app credentials into the Client ID/secret fields here. Do not paste a short-lived developer test token.
6. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Choose a board available to the authorized account.

### Where to find the fields

- **`PINTEREST_CLIENT_ID`:** Pinterest Developers > My apps > your app > App ID.
- **`PINTEREST_CLIENT_SECRET`:** App secret from that same Pinterest app.

**Permissions requested by the current SM-IT connector:** `boards:read`, `boards:write`, `pins:read`, `pins:write`, `user_accounts:read`.

### If connection fails

- A trial token or approved Trial app does not automatically authorize other customers.
- Check board ownership/permissions and the current access tier if Pin creation is denied.

**Official references:** [Open account / developer settings](https://developers.pinterest.com/), [Official setup documentation](https://developer.pinterest.com/docs/getting-started/connect-app/).

<a id="discord"></a>
## Discord

**Account needed:** A Discord account and permission to add/manage apps in the target server.

**Access and limitations:** Use a bot app. Automating an ordinary user account with a user token is not supported.

1. Open Discord Developer Portal > Applications > New Application. Name the app and open its settings.
2. In OAuth2, copy Client ID and Client Secret and add the callback displayed below to Redirects.
3. Open Bot and generate or reset the bot token. Keep it private; this is the third credential in the SM-IT form, not the OAuth client secret.
4. Enable the app’s server/guild installation. Review the requested bot permissions for sending messages, viewing channels and attaching files in the target channels.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Select the server and allow the bot installation.
6. Check that channel-level permission overrides allow the bot to send messages and media.

### Where to find the fields

- **`DISCORD_CLIENT_ID`:** Developer Portal > app > OAuth2 > Client ID.
- **`DISCORD_CLIENT_SECRET`:** OAuth2 > Client Secret.
- **`DISCORD_BOT_TOKEN_ID`:** Bot > Token. Despite the field name, enter the complete bot token, not a bot ID.

**Permissions requested by the current SM-IT connector:** `identify`, `guilds`.

### If connection fails

- The bot token must belong to the same application as the client ID; SM-IT checks that pairing.
- If installation or channel access is denied, check server permissions and bot role/channel overrides.

**Official references:** [Open account / developer settings](https://discord.com/developers/applications), [Official setup documentation](https://docs.discord.com/developers/topics/oauth2).

<a id="slack"></a>
## Slack

**Account needed:** A Slack account in a workspace where you can install apps, or approval from a workspace admin.

**Access and limitations:** Workspace app policies may require admin approval. Wider distribution has separate Slack requirements.

1. Open Slack’s app management page and create an app From scratch, selecting your development workspace.
2. In Basic Information > App Credentials, copy Client ID and Client Secret.
3. In OAuth & Permissions, register the callback below. Configure the bot scopes requested by this connector: channels:read, chat:write, users:read, groups:read, channels:join and chat:write.customize.
4. If you will connect other workspaces, configure distribution and any approval requirements. For your own workspace, confirm the administrator permits this app.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.
6. Invite the bot to the intended channel, especially private channels.

### Where to find the fields

- **`SLACK_ID`:** Slack app > Basic Information > App Credentials > Client ID.
- **`SLACK_SECRET`:** Basic Information > App Credentials > Client Secret.

**Permissions requested by the current SM-IT connector:** `channels:read`, `chat:write`, `users:read`, `groups:read`, `channels:join`, `chat:write.customize`.

### If connection fails

- Paste Client ID/Client Secret here, not an xoxb bot token or an app-level xapp token.
- missing_scope needs the matching permission plus reinstallation/re-authorization; channel_not_found can mean the bot is not a member.

**Official references:** [Open account / developer settings](https://api.slack.com/apps), [Official setup documentation](https://docs.slack.dev/authentication/installing-with-oauth/).

<a id="twitch"></a>
## Twitch

**Account needed:** A verified Twitch account with two-factor authentication enabled.

**Access and limitations:** Chat and announcement actions depend on the signed-in account’s channel role and granted scopes.

1. Sign in to Twitch Developer Console with the account that will own the app. Verify its email and enable 2FA.
2. Open Applications > Register Your Application. Enter an app name, the appropriate category and the callback below.
3. Use a confidential/server application when the dashboard offers a client type, because this connector uses a client secret.
4. Open Manage for the app, copy Client ID and generate a New Secret. Replacing the secret can invalidate connections using the old one.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.
6. For announcements, ensure the authorized account is permitted to moderate the target channel.

### Where to find the fields

- **`TWITCH_CLIENT_ID`:** Twitch Developer Console > Applications > Manage > Client ID.
- **`TWITCH_CLIENT_SECRET`:** Manage > New Secret / Client Secret for the same application.

**Permissions requested by the current SM-IT connector:** `user:write:chat`, `user:read:chat`, `moderator:manage:announcements`.

### If connection fails

- If no secret can be generated, check the app’s client type and account verification.
- A successful login alone does not grant moderator privileges in another channel.

**Official references:** [Open account / developer settings](https://dev.twitch.tv/console/apps), [Official setup documentation](https://dev.twitch.tv/docs/authentication/register-app).

<a id="kick"></a>
## Kick

**Account needed:** A Kick account with access to its developer application settings.

**Access and limitations:** Chat posting needs the chat:write permission and access to the target channel.

1. Sign in to Kick and open the developer settings/app setup linked from KICK Dev. Complete any required account verification.
2. Create a new app, enter its name, description and the website details requested by Kick.
3. In the app’s OAuth or redirect settings, register the exact callback URL shown by SM-IT below, including its scheme, port, path and any final slash. Save the provider settings.
4. Copy the generated Client ID and Client Secret. The connector requests user:read, channel:read and chat:write.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`KICK_CLIENT_ID`:** Client ID generated when creating the Kick developer app.
- **`KICK_SECRET`:** Client Secret from that same Kick app.

**Permissions requested by the current SM-IT connector:** `chat:write`, `user:read`, `channel:read`.

### If connection fails

- OAuth errors can result from a callback mismatch or missing app permissions.
- Check channel chat restrictions and the authorized account if login succeeds but sending a message is refused.

**Official references:** [Open account / developer settings](https://dev.kick.com/), [Official setup documentation](https://github.com/KickEngineering/KickDevDocs/blob/main/getting-started/kick-apps-setup.md).

<a id="mastodon"></a>
## Mastodon

**Account needed:** An account on the Mastodon server configured for this installation.

**Access and limitations:** App credentials are specific to a server. This form uses MASTODON_URL if configured, otherwise mastodon.social.

1. Sign in to your Mastodon server and open Preferences > Development > New application.
2. Name the app SM-IT, register the callback below and select scopes that cover profile, write:statuses and write:media. Save the app.
3. Open the new application and copy Client key and Client secret. Client key is the value SM-IT calls Client ID; do not use Your access token as the client ID.
4. Confirm that the app was created on the same server as the installation’s configured Mastodon instance. If using another instance, have the installation owner align the server configuration first.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`MASTODON_CLIENT_ID`:** Your Mastodon server > Preferences > Development > application > Client key.
- **`MASTODON_CLIENT_SECRET`:** Client secret on the same server/application details page.

**Permissions requested by the current SM-IT connector:** `write:statuses`, `profile`, `write:media`.

### If connection fails

- A key from one server cannot authorize an account on a different server.
- If the server does not support profile scope, its version and this connector’s requested scopes need checking.

**Official references:** [Official setup documentation](https://docs.joinmastodon.org/client/intro/).

<a id="dribbble"></a>
## Dribbble

**Account needed:** A Dribbble account permitted to upload shots, plus a registered OAuth application.

**Access and limitations:** The upload permission does not grant capabilities your Dribbble account does not already have.

1. Sign in to Dribbble and open its developer application registration/settings.
2. Register a new application with the app name, website and callback shown below.
3. Copy the application’s Client ID and Client Secret. Configure/authorize public and upload scopes for this connector.
4. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.
5. Before scheduling, confirm that the account can upload the intended shot or attachment on Dribbble itself.

### Where to find the fields

- **`DRIBBBLE_CLIENT_ID`:** Client ID issued when registering the Dribbble OAuth app.
- **`DRIBBBLE_CLIENT_SECRET`:** Client secret belonging to that OAuth app.

**Permissions requested by the current SM-IT connector:** `public`, `upload`.

### If connection fails

- A suspended application or unsupported upload permission requires Dribbble support; another secret will not grant access.
- This connector requires reconnection when Dribbble authorization expires.

**Official references:** [Open account / developer settings](https://dribbble.com/account/applications), [Official setup documentation](https://developer.dribbble.com/v2/oauth/).

<a id="tumblr"></a>
## Tumblr

**Account needed:** A Tumblr account with a blog it can publish to and a registered OAuth app.

**Access and limitations:** Use Tumblr’s OAuth 2.0 publishing flow with write and offline_access.

1. Sign in to Tumblr, open application registration/manage apps, and register SM-IT with your app and website details.
2. Set both the relevant callback/default callback and OAuth2 redirect setting to the callback shown here, as supported by the dashboard.
3. Copy OAuth consumer key and secret from the application details. For this OAuth2 connector they serve as client ID and client secret.
4. Ensure the application may request write and offline_access. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.
5. Confirm the authorized account has publishing rights to the intended blog.

### Where to find the fields

- **`TUMBLR_CLIENT_ID`:** The registered Tumblr application OAuth consumer key, used as the OAuth2 client ID.
- **`TUMBLR_CLIENT_SECRET`:** The same Tumblr application OAuth consumer secret.

**Permissions requested by the current SM-IT connector:** `write`, `offline_access`.

### If connection fails

- redirect_uri_mismatch usually means the OAuth2 redirect entry differs from the callback used here.
- Do not substitute an OAuth1 user token/secret for the application credentials.

**Official references:** [Open account / developer settings](https://www.tumblr.com/oauth/apps), [Official setup documentation](https://github.com/tumblr/docs/blob/master/api.md).

<a id="telegram"></a>
## Telegram

**Account needed:** A Telegram account and permission to add a bot to the target group or channel.

**Access and limitations:** No separate developer account or OAuth callback is needed. The bot needs posting rights in the destination.

1. In Telegram, open the verified @BotFather account and send /newbot.
2. Choose a display name and an available bot username as prompted. Copy the complete bot token BotFather returns.
3. Paste that token below and choose Test and connect. SM-IT checks the bot and displays its username.
4. Add that bot to the intended group or channel. For a channel, make it an administrator with permission to post messages and the relevant media.
5. Follow the Telegram connection screen: start the connection and send the exact /connect command it displays into the destination chat. Wait for confirmation.

### Where to find the fields

- **`TELEGRAM_TOKEN`:** The complete token issued by @BotFather for your bot.

### If connection fails

- If the test cannot identify the bot, copy its current token again from BotFather.
- If no connection command is detected, check that you sent it in the correct group/channel and that the bot can read the command and post there.

**Official references:** [Open account / developer settings](https://t.me/BotFather), [Official setup documentation](https://core.telegram.org/bots/features#botfather).

<a id="wrapcast"></a>
## Farcaster

**Account needed:** A Farcaster developer/app account and a Neynar developer account.

**Access and limitations:** Neynar API access and signer registration can involve plan usage or on-chain fees. The app account’s wallet phrase is sensitive.

1. Sign in to the Neynar developer dashboard and obtain an API key for the application/account with managed-signer access.
2. Create or select a dedicated Farcaster account representing your app. Find that account’s numeric FID in its account information or through Neynar’s user lookup.
3. Obtain the recovery phrase of that app account’s custody wallet using the wallet/account’s own recovery/export procedure. It must correspond to the app FID. Never use the recovery phrase of the person connecting their personal account.
4. Enter the Neynar API key, app FID and app wallet phrase in this local SM-IT setup. Choose Test and connect; SM-IT creates a signer request signed by the app account.
5. Scan the QR code or open the approval link in the Farcaster client. Review the app requesting access, approve the signer and complete any displayed registration fee step. Wait for the connection to finish.

### Where to find the fields

- **`NEYNAR_SECRET_KEY`:** Neynar developer dashboard > API key.
- **`NEYNAR_APP_FID`:** Numeric Farcaster ID of the app/developer account.
- **`NEYNAR_APP_MNEMONIC`:** Recovery phrase for that app account’s custody wallet, not a connecting user’s wallet.

### If connection fails

- A signature or registration failure can indicate that the phrase does not control the app FID’s custody wallet.
- If the approval is revoked, expires or never completes, start a new test. A signer from a different test is not accepted.

**Official references:** [Open account / developer settings](https://dev.neynar.com/), [Official setup documentation](https://docs.neynar.com/docs/integrate-managed-signers).

<a id="mewe"></a>
## MeWe

**Account needed:** A MeWe account approved for the MeWe Developer Program preview.

**Access and limitations:** Developer access is an approval-based preview with limited availability.

1. Sign in at MeWe developer settings and apply to the Developer Program. Wait for approval before attempting app creation.
2. Create a new application in developer settings. Choose the supported standalone/web integration and the permissions needed for your publishing use case.
3. Set its application/return URL as required by MeWe’s authentication guide using the callback shown here. Complete any additional app settings required by your approved preview.
4. Copy the application ID and API key from the application settings into the corresponding fields below.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning. Approve the MeWe login request if prompted.

### Where to find the fields

- **`MEWE_APP_ID`:** Developer settings > your application > application ID.
- **`MEWE_API_KEY`:** API key issued for the same approved application.

### If connection fails

- No developer settings or no create-app option usually means access has not been granted yet.
- A pending login request must be approved in MeWe; retry if the request has expired.

**Official references:** [Open account / developer settings](https://developer.mewe.com/developer), [Official setup documentation](https://developer.mewe.com/quickstart), [MeWe authentication flow](https://developer.mewe.com/authentication).

<a id="vk"></a>
## VK

**Account needed:** A VK ID account and an application registered in the VK ID connection dashboard.

**Access and limitations:** App eligibility and available VK posting permissions depend on the application type and VK approval.

1. Sign in to the VK ID application dashboard linked by the official SDK documentation, and create a web application.
2. Enter the site/base domain and the authorized redirect/callback shown below. Complete the required app information.
3. Copy the numeric application ID (client ID). This connector uses PKCE and exposes only the VK_ID field; it does not ask for your VK password or a service token.
4. Confirm that the app can request the VK ID/profile and wall/media permissions shown below. If the dashboard cannot grant the publishing scopes, request VK support/approval.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.

### Where to find the fields

- **`VK_ID`:** Numeric application/client ID from the VK ID web application dashboard.

**Permissions requested by the current SM-IT connector:** `vkid.personal_info`, `email`, `wall`, `status`, `docs`, `photos`, `video`.

### If connection fails

- A base-domain or redirect error needs both the site domain and callback settings checked.
- If VK refuses wall/media scopes for your app type, creating another ID cannot add them.

**Official references:** [Official setup documentation](https://github.com/VKCOM/vkid-web-sdk).

<a id="whop"></a>
## Whop

**Account needed:** A Whop account with an app and access to the community/forum you want to post in.

**Access and limitations:** The connector uses a client-ID/PKCE flow. Confirm that your Whop app supports the requested forum permissions.

1. Sign in to the Whop developer dashboard and create or select the app that will represent SM-IT.
2. Open the app’s OAuth/authentication settings, enable the supported authorization flow and register the callback shown below.
3. Copy the app’s OAuth client ID into WHOP_CLIENT_ID. This connector has no client-secret field; do not paste a Whop API key here.
4. Confirm that openid, profile, email and the forum/company permissions requested by this connector are available to your app. Consult Whop’s current developer documentation or support if the dashboard differs.
5. Return to SM-IT, enter the app credentials below, and choose Test and connect. Sign in as the account that will publish and approve the requested access. Complete any account, Page or channel selection after returning.
6. Select or configure a forum/community that the authorized account can access and post to.

### Where to find the fields

- **`WHOP_CLIENT_ID`:** OAuth client ID from your Whop application authentication settings; not a Whop API key.

**Permissions requested by the current SM-IT connector:** `openid`, `profile`, `email`, `forum:post:create`, `forum:read`, `company:basic:read`.

### If connection fails

- If your app requires client-secret authentication, it may not be compatible with the current client-ID-only connector.
- Check the member’s community access and granted forum scopes if publishing is denied.

**Official references:** [Official setup documentation](https://docs.whop.com/).

<a id="bluesky"></a>
## Bluesky

**Account needed:** A Bluesky account on bsky.social or another compatible personal data server.

**Access and limitations:** No developer app is needed for this app-password connector.

1. Sign in to Bluesky and open Settings > Privacy and Security > App Passwords (the menu grouping can vary by client).
2. Create an app password named SM-IT and copy it when displayed.
3. In SM-IT’s Bluesky form, use your server URL (normally https://bsky.social), your full account handle and the generated app password.
4. Choose Connect and wait for the account profile to be verified. Use a revocable app password rather than your main Bluesky password.

**Permissions requested by the current SM-IT connector:** `write:statuses`, `profile`, `write:media`.

### If connection fails

- Use the full handle, such as name.bsky.social, and the server that actually hosts the account.
- If the app password was revoked, create a replacement and reconnect.

**Official references:** [Open account / developer settings](https://bsky.app/settings/app-passwords), [Official setup documentation](https://bsky.social/about/blog/5-19-2023-user-faq).

<a id="devto"></a>
## DEV.to

**Account needed:** A DEV.to account that can publish articles.

**Access and limitations:** No separate OAuth developer app is needed.

1. Sign in to DEV.to and open Settings > Extensions.
2. Under DEV Community API Keys, add a descriptive name such as SM-IT and generate a key.
3. Copy the generated API key into the DEV.to API key field in SM-IT.
4. Choose Connect and wait for account verification. When composing an article, choose a publication/organization only if the account is authorized to publish there.

### If connection fails

- If the account cannot be verified, check that the key is active and was generated for the intended DEV.to account.

**Official references:** [Open account / developer settings](https://dev.to/settings/extensions), [Official setup documentation](https://developers.forem.com/api).

<a id="hashnode"></a>
## Hashnode

**Account needed:** A Hashnode account with a publication or rights to publish to one.

**Access and limitations:** Uses an account personal access token rather than an OAuth developer app.

1. Sign in to Hashnode and open account/developer settings. Find Developer settings > Access tokens or Personal access tokens.
2. Generate a personal access token for SM-IT and copy it when displayed.
3. Paste it into the Hashnode API key field and choose Connect.
4. Confirm that the connected account has access to the publication you select when composing a post. If access-token settings have moved, follow Hashnode’s current developer documentation.

### If connection fails

- A valid token does not give access to another owner’s publication; check publication membership and publishing permissions.

**Official references:** [Official setup documentation](https://docs.hashnode.com/).

<a id="medium"></a>
## Medium

**Account needed:** An existing Medium integration token issued before Medium stopped creating new integrations.

**Access and limitations:** New integration tokens and new integrations are no longer offered by Medium. New users may not be able to connect this API connector.

1. Check Medium’s API/Importing notice before attempting setup. There is no current self-service procedure here to create a new integration token.
2. If you already have an integration token, confirm with Medium that it is still allowed and usable for your existing integration.
3. Paste only that existing token into the API key field and choose Connect. This connector cannot create or restore a discontinued token.
4. If you do not have a usable token, publish using Medium’s website instead; do not substitute a password or browser cookie.

### If connection fails

- A missing token-generation section is expected for new integrations, not a missing SM-IT setting.

**Official references:** [Official setup documentation](https://help.medium.com/hc/en-us/articles/213480228-API-Importing).

<a id="wordpress"></a>
## WordPress

**Account needed:** A WordPress site where your user can publish posts and upload media.

**Access and limitations:** Uses a per-user Application Password. The site must expose the WordPress REST API and accept authenticated requests.

1. Sign in to the target site’s wp-admin as the user who will publish. Open Users > Profile.
2. Find Application Passwords, name a new password SM-IT, generate it and copy it immediately.
3. In SM-IT, enter the site’s base URL (for example https://example.com), that WordPress username and the generated Application Password.
4. Choose Connect. Check the account role permits post publishing and media uploads. This is the self-hosted WordPress REST API flow, not a WordPress.com OAuth client.

### If connection fails

- If Application Passwords is missing, check HTTPS support and site security policies with the administrator.
- 401/403 can indicate a wrong username, revoked Application Password or a proxy/security plugin blocking REST authentication.

**Official references:** [Official setup documentation](https://developer.wordpress.org/advanced-administration/security/application-passwords/).

<a id="listmonk"></a>
## listmonk

**Account needed:** Access to a listmonk installation with configured email sending and an authorized API user.

**Access and limitations:** Self-hosted newsletter publishing; sending also depends on your SMTP/email provider and list permissions.

1. Sign in to listmonk as an administrator and configure the email sender/SMTP settings and subscriber lists if this has not been done.
2. Open the user management settings and create an API user with access to the target lists, templates/media and the campaign operations needed for publishing, including sending campaigns.
3. Copy the API user’s generated secret token. In SM-IT, enter the listmonk base URL, API username and this token in the Password field.
4. Choose Connect. Before using a live subscriber list, verify your sender setup and campaign permissions with a test list.

### If connection fails

- The form’s Password field accepts the API user’s secret token; it is not an OAuth app secret.
- An authenticated API user can still lack campaign-send or list-specific permissions.

**Official references:** [Official setup documentation](https://listmonk.app/docs/roles-and-permissions/).

<a id="lemmy"></a>
## Lemmy

**Account needed:** An approved account on a Lemmy instance where you are allowed to post.

**Access and limitations:** No developer app or global API key is needed. Instance and community rules apply.

1. Choose a Lemmy instance and create an account there. Complete email verification or manual approval if the instance requires it.
2. In the Lemmy form, enter the instance base URL, your username on that instance and its account password.
3. Choose Connect and wait for the account check. If using an automated publishing account, enable its Bot Account setting where appropriate.
4. Choose communities available through that instance and follow their posting rules.

### If connection fails

- The username and password must belong to the selected instance, not a similarly named account on another instance.
- Accounts requiring a login flow this connector does not support may fail even with a correct password.

**Official references:** [Official setup documentation](https://join-lemmy.org/docs/users/01-getting-started.html).

<a id="nostr"></a>
## Nostr

**Account needed:** A Nostr signing identity you control and access to the relays used by this connector.

**Access and limitations:** A private signing key is the credential; there is no central developer account or OAuth app.

1. Create a separate publishing identity in a trusted Nostr client/wallet that supports key export.
2. Back up its private key using that client’s procedure. This connector accepts the private key format implemented by SM-IT; it does not use a browser-extension signer approval flow.
3. Enter the raw 64-character hexadecimal private signing key in the Nostr private key field and choose Connect. This connector does not decode an nsec-formatted key; use your trusted client’s supported export procedure to obtain the hexadecimal representation.
4. Check that the relays used for the identity accept your signed events. A relay may apply its own access or posting limits.

### If connection fails

- Never paste the public npub key where a private key is required.
- A private key grants signing control of the identity. Use an identity dedicated to this installation.

**Official references:** [Official setup documentation](https://github.com/nostr-protocol/nips/blob/master/01.md).

<a id="moltbook"></a>
## Moltbook

**Account needed:** An agent account/API key and access to complete the provider’s ownership-claim procedure.

**Access and limitations:** Uses the agent registration/claim flow implemented by this connector. Confirm current provider availability before relying on it.

1. Open the Moltbook channel flow in SM-IT. If you already have a claimed agent, enter its API key in the existing-agent option.
2. Otherwise, use the registration option to supply an agent name and description. Keep the returned API key private.
3. Open the returned claim URL on Moltbook and complete the ownership verification requested by the provider.
4. Return to SM-IT and check the claim status. Finish connecting only after the agent is confirmed as claimed.

### If connection fails

- An unclaimed agent may not have posting access. Follow the exact current claim instructions on the returned provider page.
- If registration is unavailable, check the provider’s status/documentation instead of generating unrelated API credentials.

**Official references:** [Official setup documentation](https://www.moltbook.com/).

<a id="skool"></a>
## Skool

**Account needed:** A Skool account with access to the target community and the SM-IT browser extension.

**Access and limitations:** This connector uses a browser session, not an official developer API key. It can stop working when the platform or session changes.

1. Sign in to Skool in the browser where the SM-IT extension is installed. Confirm you can post in the target group.
2. Follow SM-IT’s browser-extension setup instructions if it is not installed; the project’s extension build/setup is separate from creating a social developer account.
3. Choose Skool in Add Channel and read the session-access notice. Continue only if you accept that connection method.
4. Allow the installed extension to provide the required Skool session to this local app, then complete the connection. No Skool client ID or developer key is requested by this connector.

### If connection fails

- Logging out, session expiry or Skool changes can require reconnecting.
- Skool’s separate official integrations do not automatically make this browser-session connector an official API integration.

**Official references:** [Official setup documentation](https://help.skool.com/).

## Common connection problems

- **Callback/redirect mismatch:** compare the scheme, hostname, port, path and trailing slash. `localhost` and `127.0.0.1` are different addresses. Changing a domain in the provider dashboard alone does not change the callback SM-IT sends.
- **Invalid client or secret:** use values from the same app and the correct authentication flow. App IDs, API keys, user access tokens, bot tokens and client secrets are not interchangeable.
- **Missing scope or access denied:** enable the required product, complete review/verification if necessary, confirm the app role/test-user invitation and reconnect to grant the new scopes.
- **No Page/channel/community listed:** check which account signed in, its administrative/publishing role, and the resources selected on the consent screen.
- **Connected but publishing fails:** check API credits/quotas, media format/size, externally reachable media URLs and content-specific permissions. Connecting does not send a sample post or prove every media type works.
- **Expired test:** the temporary app-credential test lasts 15 minutes and is lost on backend restart. Start a new test. A timed-out test does not save its candidate keys.
- **Reconnect after replacing keys:** keep the app identity consistent with existing channel tokens. Do not publish an old channel token under a different developer app.

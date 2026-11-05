# SM-IT

Self-hosted tool for scheduling social media and chat posts, with a calendar, analytics, team management and a media library.

## Stack

- `apps/frontend`: Next.js UI, port 4200
- `apps/backend`: NestJS API, port 3000
- `apps/orchestrator`: Temporal workers that publish posts at the scheduled time
- `libraries/`: code shared between the apps
- Services: Postgres, Redis, Temporal

## Run locally (macOS)

Install the services once. They only run when you start them, with data kept in `.local/`.

```bash
brew install postgresql@17 redis temporal
```

Install dependencies and create your config. In `.env`, set `DATABASE_URL` to `postgresql://tl_smp@127.0.0.1:5432/tl_smp` and give `JWT_SECRET` a long random value.

```bash
pnpm install
```

```bash
cp .env.example .env
```

Start everything, then open http://localhost:4200. The first run also creates the database tables. App logs go to `.local/logs/app.log`.

```bash
./start.sh
```

Stop everything when you're done.

```bash
./stop.sh
```

Add platform credentials directly in **Calendar > Add Channel**. SM-IT tests them during the platform connection and saves successful app credentials to `.env` for you.

## Publishing content

After linking a channel, use **Calendar > Create Post**. See [the publishing tutorial](docs/publishing.md) for uploading a YouTube video, writing its description, choosing visibility, scheduling, and customizing content for different platforms. The same help is available inside the composer.

## Connect social channels

Open the **Step-by-step setup guide** inside each channel dialog for account requirements, developer registration, credential locations, permissions, review requirements and troubleshooting. The [complete social channel tutorial](docs/social-channel-setup.md) covers all 35 connectors, including account-password/token connections.

In **Calendar > Add Channel**, choose a platform and enter its app ID, secret or bot token in the setup form. Register the callback URL shown there, then choose **Test and connect** and approve access on the platform. This covers all 25 platforms with installation-level app credentials, including Telegram, Farcaster, VK, MeWe, Mastodon and Whop. Platforms with account-specific tokens already collect those in their channel forms.

App credentials stay temporarily in backend memory for up to 15 minutes. SM-IT writes them to the root `.env` only after the provider returns a valid account authorization; failed or cancelled tests leave the file unchanged. Saving is atomic, preserves unrelated configuration, and restricts file access to the local owner. Saved secret values are never returned to the setup form. Backend and publishing workers read updated app credentials without restarting once this version is running.

Choose the same platform again to replace its credentials, or select **Use saved credentials** to connect another account. LinkedIn profile/Page and Facebook/Instagram share their respective app credentials. Changing a shared app can require reconnecting channels authorized under the previous app. Changing a Google Business app uses dedicated Google Business credentials when no YouTube fallback was previously configured.

For the default local setup:

| Channel | Fields saved automatically after testing | Callback registered with the platform |
| --- | --- | --- |
| X | `X_API_KEY`, `X_API_SECRET` | `http://localhost:4200/integrations/social/x` |
| LinkedIn profile | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | `http://localhost:4200/integrations/social/linkedin` |
| LinkedIn Page | Same LinkedIn app credentials | `http://localhost:4200/integrations/social/linkedin-page` |
| Facebook Page | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | `http://localhost:4200/integrations/social/facebook` |
| Instagram via Facebook | Same Facebook app credentials | `http://localhost:4200/integrations/social/instagram` |
| YouTube | `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` | `http://localhost:4200/integrations/social/youtube` |

X uses OAuth 1.0a: create an app with Read and Write permissions and the API access/credits needed for posting. LinkedIn personal profiles need the **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn** products. Company Pages require Community Management access and a Page administrator. Other OAuth platforms follow a similar app-credentials and user-consent flow; platform-specific reviews and publishing permissions still apply. Providers such as Bluesky instead ask for their own account/app credentials in the channel dialog.

The URLs above describe the local configuration; a provider may require an HTTPS callback instead. Media-fetching platforms also need to reach your image/video URLs. The current app has no public login protection: do not tunnel the whole app to meet those requirements. Use a separately secured callback/media setup or a deployment with proper authentication before exposing any service publicly.

## AI

The Agent chat uses the AI accounts you've linked in Hermes, the same way Appling does. Choose the provider, model and effort in Settings > AI. Changes apply from the next message.

Open **Settings > AI > Connect AI providers** to link the same provider types as Appling:

- **Accounts**: provider sign-in, including ChatGPT/Codex, Nous, MiniMax and xAI. CLI accounts such as Claude Code, Copilot ACP and Qwen show their sign-in command.
- **API keys & cloud**: the full Hermes provider credential catalog, including advanced endpoint, region and cloud settings.
- **Custom endpoints**: OpenAI-compatible services such as LM Studio, vLLM and hosted gateways.

Existing Hermes accounts are discovered automatically. Choose a provider, select or enter its model ID, and save. SM-IT uses Hermes’ own model adapters for OAuth refresh, native APIs and CLI transports; account secrets stay in Hermes. Connecting an account is shared with Appling, while the selected Agent model is stored only in SM-IT.

SM-IT finds Hermes through the `hermes` command, or through `HERMES_PYTHON` in `.env`. To use the same runtime as this Appling checkout, set it to `/Users/u/funcoding/Appling/.venv/bin/python`. Set `HERMES_HOME` only if Appling uses a non-default Hermes profile. After changing either environment setting, restart the backend. **Refresh list** picks up newly linked accounts without restarting.

The backend starts a private Python worker over standard input/output; no extra network listener is required. Run provider tests with Hermes’ Python:

```bash
/Users/u/funcoding/Appling/.venv/bin/python -m unittest discover -s scripts/tests
pnpm exec vitest run scripts/tests/hermes-model.test.ts
```

The linked Hermes/ChatGPT connection powers Agent chat. Legacy OpenAI-only tools use a separate `OPENAI_API_KEY`; they do not inherit that login. The unconfigured image-generation button and third-party Polotno design editor have been removed from the publishing UI. You can upload photos, artwork and thumbnails you already have.

## No login

SM-IT is for one person on one computer, so it has no sign-up, login or logout. It opens straight into the app as the oldest account in the database, and creates that account the first time if the database is empty.

The app only accepts connections from this computer. Don't put it on a public server or behind a tunnel: anyone who could reach it could post from your connected channels.

## License

AGPL-3.0. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).

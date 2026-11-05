# Release notes

## 1.1.0 — 5 November 2026

### Added

- Step-by-step connection tutorials for all 35 social channel connectors, with official links, account requirements, credential locations, permissions and troubleshooting.
- A publishing tutorial in the composer and in `docs/publishing.md`, covering YouTube uploads, descriptions, titles, visibility and scheduling.
- A visible Photos & videos button and a direct YouTube title & visibility shortcut.
- Tests confirming that channel-specific text and media remain independent of shared content.

### Improved

- Clearer Shared content and Customize this channel controls, replacing confusing global-mode wording.
- YouTube description labels, editor prompts, visibility explanations and audience settings.
- Keyboard access and readable names for channel selection, plus a clear route back from settings to content.
- Media upload wording now includes both photos and videos.
- Shared previews no longer show a hardcoded verification badge.

### Removed

- Design Media and its Polotno design-editor shortcuts from the publishing interface.
- The unconfigured Generate AI Image button. It used a separate OpenAI API key, rather than the GPT login connected for Agent chat.

### Included platform features

- AI provider connections through Hermes, supporting linked accounts, API keys and compatible endpoints.
- App-credential setup for all 25 connectors requiring installation-level keys. Credentials are tested during authorization and saved to the local `.env` only after successful verification.
- Updated SM-IT branding and publishing interface.

### Validation and scope

- 35 automated tests pass, including credential isolation, safe configuration persistence, tutorial coverage and separate channel versions.
- The publishing editor was checked locally for upload discovery, YouTube settings, description retention and removal of the unused media tools.
- This is a source release for the local, owner-operated installation. Platform app approval, API access, quotas and publishing eligibility remain provider requirements. Release checks did not publish a test video or generate a paid AI image.
- The browser extension retains its independent 2.0.0 version; the SDK retains 1.0.8.

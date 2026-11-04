import 'reflect-metadata';
import { socialProviderSetup } from '@tl_smp/helpers/utils/social-provider-setup';
import { socialCredentialEnv } from './credentials/credential-context';

import { Injectable } from '@nestjs/common';
import { XProvider } from '@tl_smp/nestjs-libraries/integrations/social/x.provider';
import { SocialProvider } from '@tl_smp/nestjs-libraries/integrations/social/social.integrations.interface';
import { LinkedinProvider } from '@tl_smp/nestjs-libraries/integrations/social/linkedin.provider';
import { RedditProvider } from '@tl_smp/nestjs-libraries/integrations/social/reddit.provider';
import { DevToProvider } from '@tl_smp/nestjs-libraries/integrations/social/dev.to.provider';
import { HashnodeProvider } from '@tl_smp/nestjs-libraries/integrations/social/hashnode.provider';
import { MediumProvider } from '@tl_smp/nestjs-libraries/integrations/social/medium.provider';
import { FacebookProvider } from '@tl_smp/nestjs-libraries/integrations/social/facebook.provider';
import { InstagramProvider } from '@tl_smp/nestjs-libraries/integrations/social/instagram.provider';
import { YoutubeProvider } from '@tl_smp/nestjs-libraries/integrations/social/youtube.provider';
import { TiktokProvider } from '@tl_smp/nestjs-libraries/integrations/social/tiktok.provider';
import { TiktokBusinessProvider } from '@tl_smp/nestjs-libraries/integrations/social/tiktok.business.provider';
import { PinterestProvider } from '@tl_smp/nestjs-libraries/integrations/social/pinterest.provider';
import { DribbbleProvider } from '@tl_smp/nestjs-libraries/integrations/social/dribbble.provider';
import { LinkedinPageProvider } from '@tl_smp/nestjs-libraries/integrations/social/linkedin.page.provider';
import { ThreadsProvider } from '@tl_smp/nestjs-libraries/integrations/social/threads.provider';
import { DiscordProvider } from '@tl_smp/nestjs-libraries/integrations/social/discord.provider';
import { SlackProvider } from '@tl_smp/nestjs-libraries/integrations/social/slack.provider';
import { MastodonProvider } from '@tl_smp/nestjs-libraries/integrations/social/mastodon.provider';
import { BlueskyProvider } from '@tl_smp/nestjs-libraries/integrations/social/bluesky.provider';
import { LemmyProvider } from '@tl_smp/nestjs-libraries/integrations/social/lemmy.provider';
import { InstagramStandaloneProvider } from '@tl_smp/nestjs-libraries/integrations/social/instagram.standalone.provider';
import { FarcasterProvider } from '@tl_smp/nestjs-libraries/integrations/social/farcaster.provider';
import { TelegramProvider } from '@tl_smp/nestjs-libraries/integrations/social/telegram.provider';
import { NostrProvider } from '@tl_smp/nestjs-libraries/integrations/social/nostr.provider';
import { VkProvider } from '@tl_smp/nestjs-libraries/integrations/social/vk.provider';
import { WordpressProvider } from '@tl_smp/nestjs-libraries/integrations/social/wordpress.provider';
import { ListmonkProvider } from '@tl_smp/nestjs-libraries/integrations/social/listmonk.provider';
import { GmbProvider } from '@tl_smp/nestjs-libraries/integrations/social/gmb.provider';
import { KickProvider } from '@tl_smp/nestjs-libraries/integrations/social/kick.provider';
import { TwitchProvider } from '@tl_smp/nestjs-libraries/integrations/social/twitch.provider';
import { SocialAbstract } from '@tl_smp/nestjs-libraries/integrations/social.abstract';
import { MoltbookProvider } from '@tl_smp/nestjs-libraries/integrations/social/moltbook.provider';
import { SkoolProvider } from '@tl_smp/nestjs-libraries/integrations/social/skool.provider';
import { WhopProvider } from '@tl_smp/nestjs-libraries/integrations/social/whop.provider';
import { MeweProvider } from '@tl_smp/nestjs-libraries/integrations/social/mewe.provider';
import { TumblrProvider } from '@tl_smp/nestjs-libraries/integrations/social/tumblr.provider';

export const socialIntegrationList: Array<SocialAbstract & SocialProvider> = [
  new XProvider(),
  new LinkedinProvider(),
  new LinkedinPageProvider(),
  new RedditProvider(),
  new InstagramProvider(),
  new InstagramStandaloneProvider(),
  new FacebookProvider(),
  new ThreadsProvider(),
  new YoutubeProvider(),
  new GmbProvider(),
  new TiktokProvider(),
  new TiktokBusinessProvider(),
  new PinterestProvider(),
  new DribbbleProvider(),
  new DiscordProvider(),
  new SlackProvider(),
  new KickProvider(),
  new TwitchProvider(),
  new MastodonProvider(),
  new BlueskyProvider(),
  new LemmyProvider(),
  new FarcasterProvider(),
  new TelegramProvider(),
  new NostrProvider(),
  new VkProvider(),
  new MediumProvider(),
  new DevToProvider(),
  new HashnodeProvider(),
  new WordpressProvider(),
  new ListmonkProvider(),
  new MoltbookProvider(),
  new WhopProvider(),
  new SkoolProvider(),
  new MeweProvider(),
  new TumblrProvider(),
  // new MastodonCustomProvider(),
];

@Injectable()
export class IntegrationManager {
  // Both are env-driven so cloud and self-hosted instances can differ:
  // HIDDEN_PROVIDERS ("tiktok,x") hides providers from the add-channel screen,
  // MIGRATE_PROVIDERS ("tiktok:tiktok-business") routes a reconnect of the old
  // provider through the new provider's OAuth and migrates the channel in
  // place, keeping its id, scheduled posts and settings.
  isHiddenProvider(identifier: string) {
    return (process.env.HIDDEN_PROVIDERS || '')
      .split(',')
      .map((p) => p.trim())
      .includes(identifier);
  }

  // Note: a target provider that implements `reConnect` is not supported - the
  // connect callback would run reConnect with the old app-scoped id before the
  // migration is attempted.
  getMigrationTarget(identifier: string): string | undefined {
    const [, target] =
      (process.env.MIGRATE_PROVIDERS || '')
        .split(',')
        .map((p) => p.trim().split(':'))
        .find(([from, to]) => from === identifier && !!to) || [];

    return target &&
      target !== identifier &&
      this.getAllowedSocialsIntegrations().includes(target)
      ? target
      : undefined;
  }

  // Reverse lookup of MIGRATE_PROVIDERS: the providers whose channels a fresh
  // connect of `identifier` should adopt instead of creating a duplicate.
  getMigrationSources(identifier: string): string[] {
    return (process.env.MIGRATE_PROVIDERS || '')
      .split(',')
      .map((p) => p.trim().split(':'))
      .filter(
        ([from, to]) =>
          to === identifier &&
          !!from &&
          from !== identifier &&
          this.getAllowedSocialsIntegrations().includes(from)
      )
      .map(([from]) => from);
  }

  async getAllIntegrations() {
    return {
      social: await Promise.all(
        socialIntegrationList
          .filter((p) => !this.isHiddenProvider(p.identifier))
          .map(async (p) => ({
            setup: socialProviderSetup(p.identifier, socialCredentialEnv),
            name: p.name,
            identifier: p.identifier,
            toolTip: p.toolTip,
            editor: p.editor,
            isExternal: !!p.externalUrl,
            isWeb3: !!p.isWeb3,
            isChromeExtension: !!p.isChromeExtension,
            ...(p.extensionCookies
              ? { extensionCookies: p.extensionCookies }
              : {}),
            ...(p.customFields ? { customFields: await p.customFields() } : {}),
          }))
      ),
      article: [] as any[],
    };
  }

  getAllTools(): {
    [key: string]: {
      description: string;
      dataSchema: any;
      methodName: string;
    }[];
  } {
    return socialIntegrationList.reduce(
      (all, current) => ({
        ...all,
        [current.identifier]:
          Reflect.getMetadata('custom:tool', current.constructor.prototype) ||
          [],
      }),
      {}
    );
  }

  // POST /integrations/function runs a provider method by name with the
  // channel's token as its first argument, so only @Tool methods and the ones
  // marked @DashboardFunction may be run that way.
  isDashboardCallable(provider: SocialProvider, methodName: string) {
    if (typeof (provider as any)[methodName] !== 'function') {
      return false;
    }

    const isTool = this.getAllTools()[provider.identifier]?.some(
      (p) => p.methodName === methodName
    );

    return (
      isTool ||
      !!Reflect.getMetadata(
        'custom:dashboard_function',
        provider.constructor.prototype,
        methodName
      )
    );
  }

  getAllRulesDescription(): {
    [key: string]: string;
  } {
    return socialIntegrationList.reduce(
      (all, current) => ({
        ...all,
        [current.identifier]:
          Reflect.getMetadata(
            'custom:rules:description',
            current.constructor
          ) || '',
      }),
      {}
    );
  }

  getAllPlugs() {
    return socialIntegrationList
      .map((p) => {
        return {
          name: p.name,
          identifier: p.identifier,
          plugs: (
            Reflect.getMetadata('custom:plug', p.constructor.prototype) || []
          )
            .filter((f: any) => !f.disabled)
            .map((p: any) => ({
              ...p,
              fields: p.fields.map((c: any) => ({
                ...c,
                validation: c?.validation?.toString(),
              })),
            })),
        };
      })
      .filter((f) => f.plugs.length);
  }

  getInternalPlugs(providerName: string) {
    const p = socialIntegrationList.find((p) => p.identifier === providerName)!;
    return {
      internalPlugs:
        (
          Reflect.getMetadata(
            'custom:internal_plug',
            p.constructor.prototype
          ) || []
        ).filter((f: any) => !f.disabled) || [],
    };
  }

  getAllowedSocialsIntegrations() {
    return socialIntegrationList.map((p) => p.identifier);
  }
  getSocialIntegration(integration: string): SocialProvider {
    return socialIntegrationList.find((i) => i.identifier === integration)!;
  }
}

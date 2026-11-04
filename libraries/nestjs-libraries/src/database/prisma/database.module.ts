import { Global, Module } from '@nestjs/common';
import { PrismaRepository, PrismaService, PrismaTransaction } from './prisma.service';
import { OrganizationRepository } from '@tl_smp/nestjs-libraries/database/prisma/organizations/organization.repository';
import { OrganizationService } from '@tl_smp/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@tl_smp/nestjs-libraries/database/prisma/users/users.service';
import { UsersRepository } from '@tl_smp/nestjs-libraries/database/prisma/users/users.repository';
import { SubscriptionService } from '@tl_smp/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { SubscriptionRepository } from '@tl_smp/nestjs-libraries/database/prisma/subscriptions/subscription.repository';
import { NotificationService } from '@tl_smp/nestjs-libraries/database/prisma/notifications/notification.service';
import { IntegrationService } from '@tl_smp/nestjs-libraries/database/prisma/integrations/integration.service';
import { IntegrationRepository } from '@tl_smp/nestjs-libraries/database/prisma/integrations/integration.repository';
import { PostsService } from '@tl_smp/nestjs-libraries/database/prisma/posts/posts.service';
import { PostsRepository } from '@tl_smp/nestjs-libraries/database/prisma/posts/posts.repository';
import { IntegrationManager } from '@tl_smp/nestjs-libraries/integrations/integration.manager';
import { MediaService } from '@tl_smp/nestjs-libraries/database/prisma/media/media.service';
import { MediaRepository } from '@tl_smp/nestjs-libraries/database/prisma/media/media.repository';
import { NotificationsRepository } from '@tl_smp/nestjs-libraries/database/prisma/notifications/notifications.repository';
import { EmailService } from '@tl_smp/nestjs-libraries/services/email.service';
import { StripeService } from '@tl_smp/nestjs-libraries/services/stripe.service';
import { PaymentService } from '@tl_smp/nestjs-libraries/services/payment/payment.service';
import { PaymentProviderManager } from '@tl_smp/nestjs-libraries/services/payment/payment.provider.manager';
import { RevenueCatProvider } from '@tl_smp/nestjs-libraries/services/payment/providers/revenuecat.provider';
import { ExtractContentService } from '@tl_smp/nestjs-libraries/openai/extract.content.service';
import { OpenaiService } from '@tl_smp/nestjs-libraries/openai/openai.service';
import { DeepgramService } from '@tl_smp/nestjs-libraries/deepgram/deepgram.service';
import { ClippingService } from '@tl_smp/nestjs-libraries/database/prisma/clipping/clipping.service';
import { ClippingRepository } from '@tl_smp/nestjs-libraries/database/prisma/clipping/clipping.repository';
import { AgenciesService } from '@tl_smp/nestjs-libraries/database/prisma/agencies/agencies.service';
import { AgenciesRepository } from '@tl_smp/nestjs-libraries/database/prisma/agencies/agencies.repository';
import { TrackService } from '@tl_smp/nestjs-libraries/track/track.service';
import { ShortLinkService } from '@tl_smp/nestjs-libraries/short-linking/short.link.service';
import { WebhooksRepository } from '@tl_smp/nestjs-libraries/database/prisma/webhooks/webhooks.repository';
import { WebhooksService } from '@tl_smp/nestjs-libraries/database/prisma/webhooks/webhooks.service';
import { SignatureRepository } from '@tl_smp/nestjs-libraries/database/prisma/signatures/signature.repository';
import { SignatureService } from '@tl_smp/nestjs-libraries/database/prisma/signatures/signature.service';
import { AutopostRepository } from '@tl_smp/nestjs-libraries/database/prisma/autopost/autopost.repository';
import { AutopostService } from '@tl_smp/nestjs-libraries/database/prisma/autopost/autopost.service';
import { AiSettingsService } from '@tl_smp/nestjs-libraries/database/prisma/ai-settings/ai.settings.service';
import { AiSettingsRepository } from '@tl_smp/nestjs-libraries/database/prisma/ai-settings/ai.settings.repository';
import { SetsService } from '@tl_smp/nestjs-libraries/database/prisma/sets/sets.service';
import { SetsRepository } from '@tl_smp/nestjs-libraries/database/prisma/sets/sets.repository';
import { ThirdPartyRepository } from '@tl_smp/nestjs-libraries/database/prisma/third-party/third-party.repository';
import { ThirdPartyService } from '@tl_smp/nestjs-libraries/database/prisma/third-party/third-party.service';
import { VideoManager } from '@tl_smp/nestjs-libraries/videos/video.manager';
import { FalService } from '@tl_smp/nestjs-libraries/openai/fal.service';
import { RefreshIntegrationService } from '@tl_smp/nestjs-libraries/integrations/refresh.integration.service';
import { OAuthRepository } from '@tl_smp/nestjs-libraries/database/prisma/oauth/oauth.repository';
import { OAuthService } from '@tl_smp/nestjs-libraries/database/prisma/oauth/oauth.service';
import { AnnouncementsRepository } from '@tl_smp/nestjs-libraries/database/prisma/announcements/announcements.repository';
import { AnnouncementsService } from '@tl_smp/nestjs-libraries/database/prisma/announcements/announcements.service';
import { ErrorsRepository } from '@tl_smp/nestjs-libraries/database/prisma/errors/errors.repository';
import { ErrorsService } from '@tl_smp/nestjs-libraries/database/prisma/errors/errors.service';
import { AdminStatsRepository } from '@tl_smp/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository';
import { AdminStatsService } from '@tl_smp/nestjs-libraries/database/prisma/admin-stats/admin-stats.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    PrismaTransaction,
    UsersService,
    UsersRepository,
    OrganizationService,
    OrganizationRepository,
    SubscriptionService,
    SubscriptionRepository,
    NotificationService,
    NotificationsRepository,
    WebhooksRepository,
    WebhooksService,
    IntegrationService,
    IntegrationRepository,
    PostsService,
    PostsRepository,
    StripeService,
    PaymentService,
    PaymentProviderManager,
    RevenueCatProvider,
    SignatureRepository,
    AutopostRepository,
    AutopostService,
    SignatureService,
    MediaService,
    MediaRepository,
    AgenciesService,
    AgenciesRepository,
    IntegrationManager,
    RefreshIntegrationService,
    ExtractContentService,
    OpenaiService,
    DeepgramService,
    ClippingService,
    ClippingRepository,
    FalService,
    EmailService,
    TrackService,
    ShortLinkService,
    AiSettingsService,
    AiSettingsRepository,
    SetsService,
    SetsRepository,
    ThirdPartyRepository,
    ThirdPartyService,
    OAuthRepository,
    OAuthService,
    VideoManager,
    AnnouncementsRepository,
    AnnouncementsService,
    ErrorsRepository,
    ErrorsService,
    AdminStatsRepository,
    AdminStatsService,
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}

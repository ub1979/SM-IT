import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from '@tl_smp/backend/api/routes/auth.controller';
import { AuthService } from '@tl_smp/backend/services/auth/auth.service';
import { UsersController } from '@tl_smp/backend/api/routes/users.controller';
import { AuthMiddleware } from '@tl_smp/backend/services/auth/auth.middleware';
import { StripeService } from '@tl_smp/nestjs-libraries/services/stripe.service';
import { PaymentController } from '@tl_smp/backend/api/routes/payment.controller';
import { PaymentService } from '@tl_smp/nestjs-libraries/services/payment/payment.service';
import { PaymentProviderManager } from '@tl_smp/nestjs-libraries/services/payment/payment.provider.manager';
import { RevenueCatProvider } from '@tl_smp/nestjs-libraries/services/payment/providers/revenuecat.provider';
import { AnalyticsController } from '@tl_smp/backend/api/routes/analytics.controller';
import { PoliciesGuard } from '@tl_smp/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@tl_smp/backend/services/auth/permissions/permissions.service';
import { IntegrationsController } from '@tl_smp/backend/api/routes/integrations.controller';
import { IntegrationManager } from '@tl_smp/nestjs-libraries/integrations/integration.manager';
import { SettingsController } from '@tl_smp/backend/api/routes/settings.controller';
import { PostsController } from '@tl_smp/backend/api/routes/posts.controller';
import { MediaController } from '@tl_smp/backend/api/routes/media.controller';
import { ClippingController } from '@tl_smp/backend/api/routes/clipping.controller';
import { MediaWidgetController } from '@tl_smp/backend/api/routes/media.widget.controller';
import { UploadWidgetAuthMiddleware } from '@tl_smp/backend/services/auth/upload.widget.auth.middleware';
import { ClippingWidgetController } from '@tl_smp/backend/api/routes/clipping.widget.controller';
import { ClippingWidgetAuthMiddleware } from '@tl_smp/backend/services/auth/clipping.widget.auth.middleware';
import { UploadModule } from '@tl_smp/nestjs-libraries/upload/upload.module';
import { BillingController } from '@tl_smp/backend/api/routes/billing.controller';
import { NotificationsController } from '@tl_smp/backend/api/routes/notifications.controller';
import { OpenaiService } from '@tl_smp/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@tl_smp/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@tl_smp/nestjs-libraries/services/codes.service';
import { CopilotController } from '@tl_smp/backend/api/routes/copilot.controller';
import { PublicController } from '@tl_smp/backend/api/routes/public.controller';
import { RootController } from '@tl_smp/backend/api/routes/root.controller';
import { TrackService } from '@tl_smp/nestjs-libraries/track/track.service';
import { ShortLinkService } from '@tl_smp/nestjs-libraries/short-linking/short.link.service';
import { WebhookController } from '@tl_smp/backend/api/routes/webhooks.controller';
import { SignatureController } from '@tl_smp/backend/api/routes/signature.controller';
import { AutopostController } from '@tl_smp/backend/api/routes/autopost.controller';
import { SetsController } from '@tl_smp/backend/api/routes/sets.controller';
import { ThirdPartyController } from '@tl_smp/backend/api/routes/third-party.controller';
import { MonitorController } from '@tl_smp/backend/api/routes/monitor.controller';
import { NoAuthIntegrationsController } from '@tl_smp/backend/api/routes/no.auth.integrations.controller';
import { EnterpriseController } from '@tl_smp/backend/api/routes/enterprise.controller';
import { OAuthAppController } from '@tl_smp/backend/api/routes/oauth-app.controller';
import { ApprovedAppsController } from '@tl_smp/backend/api/routes/approved-apps.controller';
import {
  OAuthController,
  OAuthAuthorizedController,
} from '@tl_smp/backend/api/routes/oauth.controller';
import { AnnouncementsController } from '@tl_smp/backend/api/routes/announcements.controller';
import { AdminController } from '@tl_smp/backend/api/routes/admin.controller';
import { StripeController } from '@tl_smp/backend/api/routes/stripe.controller';

const authenticatedController = [
  UsersController,
  AnalyticsController,
  IntegrationsController,
  SettingsController,
  PostsController,
  MediaController,
  ClippingController,
  BillingController,
  NotificationsController,
  CopilotController,
  WebhookController,
  SignatureController,
  AutopostController,
  SetsController,
  ThirdPartyController,
  OAuthAppController,
  ApprovedAppsController,
  OAuthAuthorizedController,
  AnnouncementsController,
  AdminController,
];
@Module({
  imports: [UploadModule],
  controllers: process.env.MCP_ONLY
    ? [
        RootController,
        OAuthController,
        MediaWidgetController,
        ClippingWidgetController,
      ]
    : [
        RootController,
        PaymentController,
        StripeController,
        AuthController,
        PublicController,
        MonitorController,
        EnterpriseController,
        NoAuthIntegrationsController,
        OAuthController,
        MediaWidgetController,
        ClippingWidgetController,
        ...authenticatedController,
      ],
  providers: [
    AuthService,
    StripeService,
    PaymentService,
    PaymentProviderManager,
    RevenueCatProvider,
    OpenaiService,
    ExtractContentService,
    AuthMiddleware,
    UploadWidgetAuthMiddleware,
    PoliciesGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
    TrackService,
    ShortLinkService,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authenticatedController);
    consumer.apply(UploadWidgetAuthMiddleware).forRoutes(MediaWidgetController);
    consumer
      .apply(ClippingWidgetAuthMiddleware)
      .forRoutes(ClippingWidgetController);
  }
}

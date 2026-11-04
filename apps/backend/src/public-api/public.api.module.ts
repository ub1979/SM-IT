import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from '@tl_smp/backend/services/auth/auth.service';
import { StripeService } from '@tl_smp/nestjs-libraries/services/stripe.service';
import { PoliciesGuard } from '@tl_smp/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@tl_smp/backend/services/auth/permissions/permissions.service';
import { IntegrationManager } from '@tl_smp/nestjs-libraries/integrations/integration.manager';
import { UploadModule } from '@tl_smp/nestjs-libraries/upload/upload.module';
import { OpenaiService } from '@tl_smp/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@tl_smp/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@tl_smp/nestjs-libraries/services/codes.service';
import { PublicIntegrationsController } from '@tl_smp/backend/public-api/routes/v1/public.integrations.controller';
import { PublicAuthMiddleware } from '@tl_smp/backend/services/auth/public.auth.middleware';
import { SuperAdminGuard } from '@tl_smp/backend/services/auth/super.admin.guard';

const authenticatedController = [PublicIntegrationsController];
@Module({
  imports: [UploadModule],
  controllers: process.env.MCP_ONLY ? [] : [...authenticatedController],
  providers: [
    AuthService,
    StripeService,
    OpenaiService,
    ExtractContentService,
    PoliciesGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
    SuperAdminGuard,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class PublicApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PublicAuthMiddleware).forRoutes(...authenticatedController);
  }
}


import { Module } from '@nestjs/common';
import { PostActivity } from '@tl_smp/orchestrator/activities/post.activity';
import { getTemporalModule } from '@tl_smp/nestjs-libraries/temporal/temporal.module';
import { DatabaseModule } from '@tl_smp/nestjs-libraries/database/prisma/database.module';
import { AutopostActivity } from '@tl_smp/orchestrator/activities/autopost.activity';
import { EmailActivity } from '@tl_smp/orchestrator/activities/email.activity';
import { IntegrationsActivity } from '@tl_smp/orchestrator/activities/integrations.activity';
import { VideoActivity } from '@tl_smp/orchestrator/activities/video.activity';
import { MediaActivity } from '@tl_smp/orchestrator/activities/media.activity';
import { ClippingActivity } from '@tl_smp/orchestrator/activities/clipping.activity';
import { VideoModule } from '@tl_smp/nestjs-libraries/videos/video.module';
import { HealthController } from '@tl_smp/orchestrator/health.controller';

const activities = [
  PostActivity,
  AutopostActivity,
  EmailActivity,
  IntegrationsActivity,
  VideoActivity,
  MediaActivity,
  ClippingActivity,
];
@Module({
  imports: [
    DatabaseModule,
    VideoModule,
    getTemporalModule(true, require.resolve('./workflows'), activities),
  ],
  controllers: [HealthController],
  providers: [...activities],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class AppModule {}

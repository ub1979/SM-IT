import { IntegrationValidationTool } from '@tl_smp/nestjs-libraries/chat/tools/integration.validation.tool';
import { IntegrationTriggerTool } from '@tl_smp/nestjs-libraries/chat/tools/integration.trigger.tool';
import { IntegrationSchedulePostTool } from './integration.schedule.post';
import { GenerateVideoOptionsTool } from '@tl_smp/nestjs-libraries/chat/tools/generate.video.options.tool';
import { VideoFunctionTool } from '@tl_smp/nestjs-libraries/chat/tools/video.function.tool';
import { GenerateVideoTool } from '@tl_smp/nestjs-libraries/chat/tools/generate.video.tool';
import { VideoStatusTool } from '@tl_smp/nestjs-libraries/chat/tools/video.status.tool';
import { ClippingTool } from '@tl_smp/nestjs-libraries/chat/tools/clipping.tool';
import { ClippingStatusTool } from '@tl_smp/nestjs-libraries/chat/tools/clipping.status.tool';
import { ClippingWidgetTicketTool } from '@tl_smp/nestjs-libraries/chat/tools/clipping.widget.ticket.tool';
import { GenerateImageTool } from '@tl_smp/nestjs-libraries/chat/tools/generate.image.tool';
import { IntegrationListTool } from '@tl_smp/nestjs-libraries/chat/tools/integration.list.tool';
import { GroupListTool } from '@tl_smp/nestjs-libraries/chat/tools/group.list.tool';
import { UploadFromUrlTool } from '@tl_smp/nestjs-libraries/chat/tools/upload.from.url.tool';
import { MediaListTool } from '@tl_smp/nestjs-libraries/chat/tools/media.list.tool';
import { MediaStatusTool } from '@tl_smp/nestjs-libraries/chat/tools/media.status.tool';
import { PostsListTool } from '@tl_smp/nestjs-libraries/chat/tools/posts.list.tool';
import { PostSettingsTool } from '@tl_smp/nestjs-libraries/chat/tools/post.settings.tool';
import { DeletePostTool } from '@tl_smp/nestjs-libraries/chat/tools/delete.post.tool';
import { UploadWidgetTool } from '@tl_smp/nestjs-libraries/chat/tools/upload.widget.tool';
import { UploadWidgetTicketTool } from '@tl_smp/nestjs-libraries/chat/tools/upload.widget.ticket.tool';
import { UploadWidgetStatusTool } from '@tl_smp/nestjs-libraries/chat/tools/upload.widget.status.tool';

export const toolList = [
  IntegrationListTool,
  GroupListTool,
  IntegrationValidationTool,
  IntegrationTriggerTool,
  IntegrationSchedulePostTool,
  PostsListTool,
  PostSettingsTool,
  DeletePostTool,
  GenerateVideoOptionsTool,
  VideoFunctionTool,
  GenerateVideoTool,
  VideoStatusTool,
  ClippingTool,
  ClippingStatusTool,
  ClippingWidgetTicketTool,
  GenerateImageTool,
  UploadFromUrlTool,
  MediaListTool,
  MediaStatusTool,
  UploadWidgetTool,
  UploadWidgetTicketTool,
  UploadWidgetStatusTool,
];

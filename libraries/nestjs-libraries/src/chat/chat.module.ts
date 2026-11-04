import { Global, Module } from '@nestjs/common';
import { LoadToolsService } from '@tl_smp/nestjs-libraries/chat/load.tools.service';
import { MastraService } from '@tl_smp/nestjs-libraries/chat/mastra.service';
import { toolList } from '@tl_smp/nestjs-libraries/chat/tools/tool.list';
import { McpRelayService } from '@tl_smp/nestjs-libraries/chat/mcp.relay.service';

@Global()
@Module({
  providers: [MastraService, LoadToolsService, McpRelayService, ...toolList],
  get exports() {
    return this.providers;
  },
})
export class ChatModule {}

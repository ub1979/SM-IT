import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { GetOrgFromRequest } from '@tl_smp/nestjs-libraries/user/org.from.request';
import { GetUserFromRequest } from '@tl_smp/nestjs-libraries/user/user.from.request';
import { Organization, User } from '@prisma/client';
import { CheckPolicies } from '@tl_smp/backend/services/auth/permissions/permissions.ability';
import { OrganizationService } from '@tl_smp/nestjs-libraries/database/prisma/organizations/organization.service';
import { AddTeamMemberDto } from '@tl_smp/nestjs-libraries/dtos/settings/add.team.member.dto';
import { AdminAddTeamMemberDto } from '@tl_smp/nestjs-libraries/dtos/settings/admin.add.team.member.dto';
import { ShortlinkPreferenceDto } from '@tl_smp/nestjs-libraries/dtos/settings/shortlink-preference.dto';
import { AiConnectionActionDto } from '@tl_smp/nestjs-libraries/dtos/settings/ai.connection.dto';
import { AiSettingsDto } from '@tl_smp/nestjs-libraries/dtos/settings/ai.settings.dto';
import { AiSettingsService } from '@tl_smp/nestjs-libraries/database/prisma/ai-settings/ai.settings.service';
import { ApiTags } from '@nestjs/swagger';
import {
  AuthorizationActions,
  Sections,
} from '@tl_smp/backend/services/auth/permissions/permission.exception.class';

@ApiTags('Settings')
@Controller('/settings')
export class SettingsController {
  constructor(
    private _organizationService: OrganizationService,
    private _aiSettingsService: AiSettingsService
  ) {}

  @Get('/ai')
  getAiSettings() {
    return this._aiSettingsService.getSettings();
  }

  @Get('/ai/models')
  getAiModels(@Query('refresh') refresh?: string) {
    return this._aiSettingsService.getOptions(refresh === 'true');
  }

  // Account credentials use the same owner permissions as the AI model choice.
  @Get('/ai/connections')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  getAiConnections() {
    return this._aiSettingsService.getConnections();
  }

  @Post('/ai/connections')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  updateAiConnection(@Body() body: AiConnectionActionDto) {
    return this._aiSettingsService.updateConnection(body);
  }

  @Post('/ai')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async saveAiSettings(@Body() body: AiSettingsDto) {
    await this._aiSettingsService.saveSettings(body);
    return { saved: true };
  }

  @Get('/team')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  async getTeam(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.getTeam(org.id);
  }

  @Post('/team')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  async inviteTeamMember(
    @GetOrgFromRequest() org: Organization,
    @GetUserFromRequest() user: User,
    @Body() body: AddTeamMemberDto
  ) {
    return this._organizationService.inviteTeamMember(org, user, body);
  }

  @Post('/team/add')
  async addTeamMember(
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() org: Organization,
    @Body() body: AdminAddTeamMemberDto
  ) {
    if (!user.isSuperAdmin) {
      throw new HttpException('Unauthorized', 400);
    }

    return this._organizationService.addTeamMemberByEmail(org, body);
  }

  @Delete('/team/:id')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  deleteTeamMember(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._organizationService.deleteTeamMember(org, id);
  }

  @Get('/shortlink')
  async getShortlinkPreference(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.getShortlinkPreference(org.id);
  }

  @Post('/shortlink')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async updateShortlinkPreference(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ShortlinkPreferenceDto
  ) {
    return this._organizationService.updateShortlinkPreference(
      org.id,
      body.shortlink
    );
  }
}

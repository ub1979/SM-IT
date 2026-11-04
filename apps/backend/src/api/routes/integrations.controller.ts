import { socialProviderSetup } from '@tl_smp/helpers/utils/social-provider-setup';
import { socialCredentialSetup } from '@tl_smp/nestjs-libraries/integrations/credentials/credential-setup';
import { socialCredentialEnv } from '@tl_smp/nestjs-libraries/integrations/credentials/credential-context';
import { FarcasterProvider } from '@tl_smp/nestjs-libraries/integrations/social/farcaster.provider';
import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ioRedis } from '@tl_smp/nestjs-libraries/redis/redis.service';
import { IntegrationManager } from '@tl_smp/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@tl_smp/nestjs-libraries/database/prisma/integrations/integration.service';
import { GetOrgFromRequest } from '@tl_smp/nestjs-libraries/user/org.from.request';
import { Organization, User } from '@prisma/client';
import { IntegrationFunctionDto } from '@tl_smp/nestjs-libraries/dtos/integrations/integration.function.dto';
import { CheckPolicies } from '@tl_smp/backend/services/auth/permissions/permissions.ability';
import { pricing } from '@tl_smp/nestjs-libraries/database/prisma/subscriptions/pricing';
import { ApiTags } from '@nestjs/swagger';
import { GetUserFromRequest } from '@tl_smp/nestjs-libraries/user/user.from.request';
import { PostsService } from '@tl_smp/nestjs-libraries/database/prisma/posts/posts.service';
import { IntegrationTimeDto } from '@tl_smp/nestjs-libraries/dtos/integrations/integration.time.dto';
import { IntegrationNameDto } from '@tl_smp/nestjs-libraries/dtos/integrations/integration.name.dto';
import { CustomerNameDto } from '@tl_smp/nestjs-libraries/dtos/integrations/customer.name.dto';
import { PlugDto } from '@tl_smp/nestjs-libraries/dtos/plugs/plug.dto';
import {
  Disconnect,
  RefreshToken,
} from '@tl_smp/nestjs-libraries/integrations/social.abstract';

import { timer } from '@tl_smp/helpers/utils/timer';
import { TelegramProvider } from '@tl_smp/nestjs-libraries/integrations/social/telegram.provider';
import { MoltbookProvider } from '@tl_smp/nestjs-libraries/integrations/social/moltbook.provider';
import {
  AuthorizationActions,
  Sections,
} from '@tl_smp/backend/services/auth/permissions/permission.exception.class';
import { uniqBy } from 'lodash';
import { RefreshIntegrationService } from '@tl_smp/nestjs-libraries/integrations/refresh.integration.service';

@ApiTags('Integrations')
@Controller('/integrations')
export class IntegrationsController {
  constructor(
    private _integrationManager: IntegrationManager,
    private _integrationService: IntegrationService,
    private _postService: PostsService,
    private _refreshIntegrationService: RefreshIntegrationService
  ) {}

  @Post('/credentials/:integration')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async stageCredentials(
    @Param('integration') integration: string,
    @GetOrgFromRequest() org: Organization,
    @Body() body: { values: Record<string, string> }
  ) {
    if (
      !this._integrationManager
        .getAllowedSocialsIntegrations()
        .includes(integration)
    )
      throw new BadRequestException('Unknown platform');
    try {
      return {
        setupToken: socialCredentialSetup.stage(
          org.id,
          integration,
          body?.values
        ),
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/credentials/:integration/test-action')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async credentialTestAction(
    @Param('integration') integration: string,
    @GetOrgFromRequest() org: Organization,
    @Body()
    body: {
      setupToken: string;
      action: string;
      signerUuid?: string;
      word?: string;
      id?: number;
    }
  ) {
    try {
      return await socialCredentialSetup.run(
        body.setupToken,
        org.id,
        integration,
        async () => {
          if (integration === 'wrapcast' && body.action === 'create-signer') {
            const signer = await new FarcasterProvider().createSigner();
            socialCredentialSetup.rememberSigner(
              body.setupToken,
              org.id,
              signer.signerUuid
            );
            return signer;
          }
          if (
            integration === 'wrapcast' &&
            body.action === 'signer-status' &&
            typeof body.signerUuid === 'string'
          )
            return new FarcasterProvider().signerStatus(body.signerUuid);
          if (
            integration === 'telegram' &&
            body.action === 'telegram-updates' &&
            typeof body.word === 'string' &&
            /^[a-zA-Z0-9]{1,40}$/.test(body.word)
          ) {
            return new TelegramProvider().getBotId({
              word: body.word,
              ...(Number.isSafeInteger(body.id) ? { id: body.id } : {}),
            });
          }
          throw new Error('Invalid action');
        }
      );
    } catch {
      throw new BadRequestException(
        'The platform test failed or expired. Check the keys and app access, then try again. No credentials were saved.'
      );
    }
  }

  @Post('/provider/:id/connect')
  @CheckPolicies([AuthorizationActions.Create, Sections.CHANNEL])
  async saveProviderPage(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this._integrationService.saveProviderPage(org.id, id, body);
  }

  @Get('/:identifier/internal-plugs')
  getInternalPlugs(@Param('identifier') identifier: string) {
    return this._integrationManager.getInternalPlugs(identifier);
  }

  @Get('/customers')
  getCustomers(@GetOrgFromRequest() org: Organization) {
    return this._integrationService.customers(org.id);
  }

  @Put('/customers/:id')
  async updateCustomerName(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: CustomerNameDto
  ) {
    return this._integrationService.updateCustomerName(org.id, id, body.name);
  }

  @Put('/:id/group')
  async updateIntegrationGroup(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: { group: string }
  ) {
    return this._integrationService.updateIntegrationGroup(
      org.id,
      id,
      body.group
    );
  }

  @Put('/:id/customer-name')
  async updateOnCustomerName(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: { name: string }
  ) {
    return this._integrationService.updateOnCustomerName(org.id, id, body.name);
  }

  @Put('/:id/custom-name')
  async updateCustomName(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: IntegrationNameDto
  ) {
    return this._integrationService.updateCustomName(org.id, id, body.name);
  }

  @Get('/list')
  async getIntegrationList(@GetOrgFromRequest() org: Organization) {
    return {
      integrations: await Promise.all(
        (
          await this._integrationService.getIntegrationsList(org.id)
        ).map(async (p) => {
          const findIntegration = this._integrationManager.getSocialIntegration(
            p.providerIdentifier
          );
          return {
            name: p.customName || p.name,
            originalName: p.name,
            id: p.id,
            internalId: p.internalId,
            disabled: p.disabled,
            editor: findIntegration.editor,
            stripLinks: !!findIntegration?.stripLinks?.(),
            picture: p.picture || '/no-picture.jpg',
            identifier: p.providerIdentifier,
            inBetweenSteps: p.inBetweenSteps,
            refreshNeeded: p.refreshNeeded,
            isCustomFields: !!findIntegration.customFields,
            ...(findIntegration.customFields
              ? { customFields: await findIntegration.customFields() }
              : {}),
            display: p.profile,
            type: p.type,
            time: JSON.parse(p.postingTimes),
            changeProfilePicture: !!findIntegration?.changeProfilePicture,
            changeNickName: !!findIntegration?.changeNickname,
            customer: p.customer,
            additionalSettings: p.additionalSettings || '[]',
          };
        })
      ),
    };
  }

  @Post('/:id/settings')
  async updateProviderSettings(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body('additionalSettings') body: string
  ) {
    if (typeof body !== 'string') {
      throw new Error('Invalid body');
    }

    await this._integrationService.updateProviderSettings(org.id, id, body);
  }
  @Post('/:id/nickname')
  async setNickname(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: { name: string; picture: string }
  ) {
    const integration = await this._integrationService.getIntegrationById(
      org.id,
      id
    );
    if (!integration) {
      throw new Error('Invalid integration');
    }

    const manager = this._integrationManager.getSocialIntegration(
      integration.providerIdentifier
    );
    if (!manager.changeProfilePicture && !manager.changeNickname) {
      throw new Error('Invalid integration');
    }

    const { url } = manager.changeProfilePicture
      ? await manager.changeProfilePicture(
          integration.internalId,
          integration.token,
          body.picture
        )
      : { url: '' };

    const { name } = manager.changeNickname
      ? await manager.changeNickname(
          integration.internalId,
          integration.token,
          body.name
        )
      : { name: '' };

    return this._integrationService.updateNameAndUrl(id, name, url);
  }

  @Get('/:id')
  getSingleIntegration(
    @Param('id') id: string,
    @Query('order') order: string,
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() org: Organization
  ) {
    return this._integrationService.getIntegrationForOrder(
      id,
      order,
      user.id,
      org.id
    );
  }

  @Get('/social/:integration')
  @CheckPolicies([AuthorizationActions.Create, Sections.CHANNEL])
  async getIntegrationUrl(
    @Param('integration') integration: string,
    @Query('refresh') refresh: string,
    @Query('externalUrl') externalUrl: string,
    @Query('redirectUrl') redirectUrl: string,
    @Query('onboarding') onboarding: string,
    @Query('setupToken') setupToken: string,
    @GetOrgFromRequest() org: Organization
  ) {
    if (
      !this._integrationManager
        .getAllowedSocialsIntegrations()
        .includes(integration)
    ) {
      throw new Error('Integration not allowed');
    }

    // A provider migrated via MIGRATE_PROVIDERS reconnects through its target
    // provider's OAuth: the callback lands on the target and the channel is
    // migrated in place (see migrateIntegration).
    const migrateTo = refresh
      ? this._integrationManager.getMigrationTarget(integration)
      : undefined;

    const integrationProvider = this._integrationManager.getSocialIntegration(
      migrateTo || integration
    );

    const setup = socialProviderSetup(
      integrationProvider.identifier,
      socialCredentialEnv
    );
    if (!setupToken && setup && !setup.configured) {
      return {
        err: true,
        message:
          'Enter the app credentials in the channel setup form and choose Test and connect.',
        setup,
      };
    }

    if (integrationProvider.externalUrl && !externalUrl) {
      throw new Error('Missing external url');
    }

    try {
      const getExternalUrl = integrationProvider.externalUrl
        ? {
            ...(await integrationProvider.externalUrl(externalUrl)),
            instanceUrl: externalUrl,
          }
        : undefined;

      const generate = () =>
        integrationProvider.generateAuthUrl(getExternalUrl);
      const { codeVerifier, state, url } = setupToken
        ? await socialCredentialSetup.begin(
            setupToken,
            org.id,
            integrationProvider.identifier,
            generate
          )
        : await generate();

      if (setupToken)
        await ioRedis.set(`credential-setup:${state}`, 'true', 'EX', 3600);

      if (refresh) {
        await ioRedis.set(`refresh:${state}`, refresh, 'EX', 3600);
      }

      if (onboarding === 'true') {
        await ioRedis.set(`onboarding:${state}`, 'true', 'EX', 3600);
      }

      if (redirectUrl) {
        await ioRedis.set(`redirect:${state}`, redirectUrl, 'EX', 3600);
      }

      await ioRedis.set(`organization:${state}`, org.id, 'EX', 3600);
      await ioRedis.set(`login:${state}`, codeVerifier, 'EX', 3600);
      await ioRedis.set(
        `external:${state}`,
        JSON.stringify(getExternalUrl),
        'EX',
        3600
      );

      const botName =
        integrationProvider.identifier === 'telegram'
          ? await (setupToken
              ? socialCredentialSetup.run(setupToken, org.id, 'telegram', () =>
                  new TelegramProvider().botName()
                )
              : new TelegramProvider().botName())
          : undefined;
      return { url, botName };
    } catch (err) {
      return {
        err: true,
        message:
          'Could not start the connection test. Check the keys, callback URL and app permissions, then try again. No credentials were saved.',
      };
    }
  }

  @Post('/:id/time')
  async setTime(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: IntegrationTimeDto
  ) {
    return this._integrationService.setTimes(org.id, id, body);
  }

  @Post('/mentions')
  async mentions(
    @GetOrgFromRequest() org: Organization,
    @Body() body: IntegrationFunctionDto
  ) {
    const getIntegration = await this._integrationService.getIntegrationById(
      org.id,
      body.id
    );
    if (!getIntegration) {
      throw new Error('Invalid integration');
    }

    let newList: any[] | { none: true } = [];
    try {
      newList =
        (await this.functionIntegration(org, { ...body, name: 'mention' })) ||
        [];
    } catch (err) {
      console.log(err);
    }

    if (!Array.isArray(newList) && newList?.none) {
      return newList;
    }

    const list = await this._integrationService.getMentions(
      getIntegration.providerIdentifier,
      body?.data?.query
    );

    if (Array.isArray(newList) && newList.length) {
      await this._integrationService.insertMentions(
        getIntegration.providerIdentifier,
        newList
          .map((p: any) => ({
            name: p.label || '',
            username: p.id || '',
            image: p.image || '',
            doNotCache: p.doNotCache || false,
          }))
          .filter((f: any) => f.name && !f.doNotCache)
      );
    }

    return uniqBy(
      [
        ...list.map((p) => ({
          id: p.username,
          image: p.image,
          label: p.name,
        })),
        ...(newList as any[]),
      ],
      (p) => p.id
    ).filter((f) => f.label && f.id);
  }

  @Post('/function')
  async functionIntegration(
    @GetOrgFromRequest() org: Organization,
    @Body() body: IntegrationFunctionDto
  ): Promise<any> {
    const getIntegration = await this._integrationService.getIntegrationById(
      org.id,
      body.id
    );
    if (!getIntegration) {
      throw new Error('Invalid integration');
    }

    const integrationProvider = this._integrationManager.getSocialIntegration(
      getIntegration.providerIdentifier
    );
    if (!integrationProvider) {
      throw new Error('Invalid provider');
    }

    if (
      this._integrationManager.isDashboardCallable(
        integrationProvider,
        body.name
      )
    ) {
      try {
        // @ts-ignore
        const load = await integrationProvider[body.name](
          getIntegration.token,
          body.data,
          getIntegration.internalId,
          getIntegration
        );

        return load;
      } catch (err) {
        // The platform will keep rejecting this channel until the user
        // re-connects it: mark it as needing a refresh instead of retrying.
        if (err instanceof Disconnect) {
          await this._integrationService.disconnectChannel(
            org.id,
            getIntegration
          );
          return false;
        }

        if (err instanceof RefreshToken) {
          const data = await this._refreshIntegrationService.refresh(
            getIntegration
          );

          if (!data) {
            return;
          }

          const { accessToken } = data;

          if (accessToken) {
            if (integrationProvider.refreshWait) {
              await timer(10000);
            }
            return this.functionIntegration(org, body);
          }

          return false;
        }

        return false;
      }
    }
    throw new Error('Function not found');
  }

  @Post('/disable')
  disableChannel(
    @GetOrgFromRequest() org: Organization,
    @Body('id') id: string
  ) {
    return this._integrationService.disableChannel(org.id, id);
  }

  @Post('/enable')
  enableChannel(
    @GetOrgFromRequest() org: Organization,
    @Body('id') id: string
  ) {
    return this._integrationService.enableChannel(
      org.id,
      // @ts-ignore
      org?.subscription?.totalChannels || pricing.FREE.channel,
      id
    );
  }

  @Delete('/')
  async deleteChannel(
    @GetOrgFromRequest() org: Organization,
    @Body('id') id: string
  ) {
    const isTherePosts = await this._integrationService.getPostsForChannel(
      org.id,
      id
    );
    if (isTherePosts.length) {
      for (const post of isTherePosts) {
        this._postService.deletePost(org.id, post.group).catch((err) => {});
      }
    }

    return this._integrationService.deleteChannel(org.id, id);
  }

  @Get('/plug/list')
  async getPlugList() {
    return { plugs: this._integrationManager.getAllPlugs() };
  }

  @Get('/:id/plugs')
  async getPlugsByIntegrationId(
    @Param('id') id: string,
    @GetOrgFromRequest() org: Organization
  ) {
    return this._integrationService.getPlugsByIntegrationId(org.id, id);
  }

  @Post('/:id/plugs')
  async postPlugsByIntegrationId(
    @Param('id') id: string,
    @GetOrgFromRequest() org: Organization,
    @Body() body: PlugDto
  ) {
    return this._integrationService.createOrUpdatePlug(org.id, id, body);
  }

  @Put('/plugs/:id/activate')
  async changePlugActivation(
    @Param('id') id: string,
    @GetOrgFromRequest() org: Organization,
    @Body('status') status: boolean
  ) {
    return this._integrationService.changePlugActivation(org.id, id, status);
  }

  @Get('/telegram/updates')
  async getUpdates(@Query() query: { word: string; id?: number }) {
    return new TelegramProvider().getBotId(query);
  }

  @Post('/moltbook/register')
  async moltbookRegister(@Body() body: { name: string; description: string }) {
    try {
      const provider = new MoltbookProvider();
      const result = await provider.registerAgent(body.name, body.description);
      return {
        apiKey: result.api_key,
        claimUrl: result.claim_url,
        verificationCode: result.verification_code,
      };
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  }

  @Get('/moltbook/status')
  async moltbookStatus(@Query('apiKey') apiKey: string) {
    try {
      const provider = new MoltbookProvider();
      const result = await provider.checkAgentStatus(apiKey);
      return { claimed: result?.status === 'claimed' };
    } catch (err) {
      return { claimed: false };
    }
  }
}

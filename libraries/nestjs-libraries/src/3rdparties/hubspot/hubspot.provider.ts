import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@tl_smp/nestjs-libraries/3rdparties/thirdparty.interface';
import { hubspotInstallUrl } from '@tl_smp/nestjs-libraries/database/prisma/oauth/oauth.service';

@ThirdParty({
  identifier: 'hubspot',
  title: 'HubSpot',
  description:
    'Schedule and manage your posts from HubSpot agents in Agent Builder.',
  fields: [],
  installUrl: hubspotInstallUrl,
})
export class HubspotProvider extends ThirdPartyAbstract {
  // Installed in HubSpot through installUrl, never connected with an API key
  async checkConnection(): Promise<false> {
    return false;
  }

  async sendData(): Promise<string> {
    throw new Error('HubSpot provider does not support sendData');
  }
}

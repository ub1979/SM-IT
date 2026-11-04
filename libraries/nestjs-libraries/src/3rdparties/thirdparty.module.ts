import { Global, Module } from '@nestjs/common';
import { HeygenProvider } from '@tl_smp/nestjs-libraries/3rdparties/heygen/heygen.provider';
import { ReelFarmProvider } from '@tl_smp/nestjs-libraries/3rdparties/reelfarm/reelfarm.provider';
import { HubspotProvider } from '@tl_smp/nestjs-libraries/3rdparties/hubspot/hubspot.provider';
import { ThirdPartyManager } from '@tl_smp/nestjs-libraries/3rdparties/thirdparty.manager';

@Global()
@Module({
  providers: [
    HeygenProvider,
    ReelFarmProvider,
    HubspotProvider,
    ThirdPartyManager,
  ],
  get exports() {
    return this.providers;
  },
})
export class ThirdPartyModule {}

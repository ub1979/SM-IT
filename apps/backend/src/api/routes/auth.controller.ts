import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerRealIpGuard } from '@tl_smp/nestjs-libraries/throttler/throttler.provider';
import { ApiTags } from '@nestjs/swagger';
import { FarcasterProvider } from '@tl_smp/nestjs-libraries/integrations/social/farcaster.provider';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  // public and creates a signer at Neynar per call, so cap it per client
  @UseGuards(ThrottlerRealIpGuard)
  @Throttle({ default: { limit: 30, ttl: 3600000 } })
  @Post('/farcaster/signer')
  async farcasterSigner() {
    try {
      return await new FarcasterProvider().createSigner();
    } catch (err: any) {
      return { error: err.message || 'Failed to create signer' };
    }
  }

  // the modal polls every 2s for up to 10 minutes, so leave room for that
  @UseGuards(ThrottlerRealIpGuard)
  @Throttle({ default: { limit: 1000, ttl: 3600000 } })
  @Get('/farcaster/signer')
  async farcasterSignerStatus(@Query('signerUuid') signerUuid: string) {
    try {
      return await new FarcasterProvider().signerStatus(signerUuid);
    } catch (err: any) {
      return { error: err.message || 'Failed to check signer' };
    }
  }
}

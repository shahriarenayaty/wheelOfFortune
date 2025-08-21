import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_GAMIFICATION,
} from '../utils/moleculer/moleculer.constants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RedeemReferralDto } from './dto/redeem-referral.dto';
import { GetToken } from '../auth/get-token.decorator';

@Controller('referrals')
export class ReferralsController {
  constructor(@Inject(SERVICE_GAMIFICATION) private broker: ServiceBroker) {}

  //1- fix auth
  //2- get userId from @GetUser decorator
  @Post('redeem')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  redeem(@GetToken() token: string, @Body() redeemDto: RedeemReferralDto) {
    return this.broker.call(MoleculerActions.GAMIFICATION.REDEEM, redeemDto, {
      meta: {
        token,
      },
    });
  }
}

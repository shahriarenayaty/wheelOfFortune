import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_GAMIFICATION,
} from '../utils/moleculer/moleculer.constants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RedeemReferralDto } from './dto/redeem-referral.dto';
import { GetUser } from '../auth/get-user-id.decorator';
import { IUser } from '../auth/jwt.strategy';

@Controller('referrals')
export class ReferralsController {
  constructor(@Inject(SERVICE_GAMIFICATION) private broker: ServiceBroker) {}

  //1- fix auth
  //2- get userId from @GetUser decorator
  @Post('redeem')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  redeem(@GetUser() user: IUser, @Body() redeemDto: RedeemReferralDto) {
    return this.broker.call(MoleculerActions.GAMIFICATION.REDEEM, redeemDto, {
      meta: {
        user,
      },
    });
  }
}

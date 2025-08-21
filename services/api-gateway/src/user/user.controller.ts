import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_GAMIFICATION,
} from '../utils/moleculer/moleculer.constants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetToken } from '../auth/get-token.decorator';

@Controller('users')
export class UsersController {
  constructor(@Inject(SERVICE_GAMIFICATION) private broker: ServiceBroker) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  getBalance(@GetToken() token: string) {
    return this.broker.call(
      MoleculerActions.GAMIFICATION.GET_BALANCE,
      {},
      {
        meta: {
          token,
        },
      },
    );
  }
}

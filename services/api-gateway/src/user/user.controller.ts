import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_GAMIFICATION,
} from '../utils/moleculer/moleculer.constants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user-id.decorator';
import { IUser } from '../auth/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(@Inject(SERVICE_GAMIFICATION) private broker: ServiceBroker) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  getBalance(@GetUser() user: IUser) {
    return this.broker.call(
      MoleculerActions.GAMIFICATION.GET_BALANCE,
      {},
      {
        meta: {
          user,
        },
      },
    );
  }
}

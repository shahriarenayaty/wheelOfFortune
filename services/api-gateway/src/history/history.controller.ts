import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_HISTORY,
} from '../utils/moleculer/moleculer.constants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user-id.decorator';
import { IUser } from '../auth/jwt.strategy';

@Controller('histories')
export class HistoryController {
  constructor(@Inject(SERVICE_HISTORY) private broker: ServiceBroker) {}

  @Get('prize')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  prize(@GetUser() user: IUser) {
    return this.broker.call(
      MoleculerActions.HISTORY.PRIZE,
      {},
      {
        meta: {
          user,
        },
      },
    );
  }
}

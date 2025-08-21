import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_HISTORY,
} from '../utils/moleculer/moleculer.constants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetToken } from '../auth/get-token.decorator';

@Controller('histories')
export class HistoryController {
  constructor(@Inject(SERVICE_HISTORY) private broker: ServiceBroker) {}

  @Get('prize')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  prize(@GetToken() token: string) {
    return this.broker.call(
      MoleculerActions.HISTORY.PRIZE,
      {},
      {
        meta: {
          token,
        },
      },
    );
  }
}

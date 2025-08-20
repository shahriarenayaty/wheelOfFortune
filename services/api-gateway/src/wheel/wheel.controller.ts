import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_WHEEL,
} from '../utils/moleculer/moleculer.constants';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user-id.decorator';
import { IUser } from '../auth/jwt.strategy';

@Controller('wheel')
export class WheelController {
  constructor(@Inject(SERVICE_WHEEL) private broker: ServiceBroker) {}

  @Post('spin')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  spin(@GetUser() user: IUser) {
    return this.broker.call(
      MoleculerActions.WHEEL.SPIN,
      {},
      {
        meta: {
          user,
        },
      },
    );
  }
}

import * as os from 'os';
import { Module } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import { SERVICE_HISTORY } from '../utils/moleculer/moleculer.constants';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../utils/config.schema';
import { JwtStrategy } from '../auth/jwt.strategy';
import { HistoryController } from './history.controller';

@Module({
  imports: [],
  controllers: [HistoryController],
  providers: [
    JwtStrategy,
    {
      provide: SERVICE_HISTORY,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvConfig>) => {
        const randomNumber = Math.floor(Math.random() * 10000);
        const broker = new ServiceBroker({
          nodeID: `${configService.get('NODE_ID_PREFIX')}-${os.hostname().toLowerCase()}-${process.pid}-${randomNumber}`,
          namespace: configService.get('NAMESPACE'),
          transporter: {
            type: 'NATS',
            options: { url: configService.get('NATS_URL') },
          },
        });
        await broker.start();
        return broker;
      },
    },
  ],
})
export class HistoryModule {}

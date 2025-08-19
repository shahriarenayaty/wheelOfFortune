import * as os from 'os';
import { Module } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import { SERVICE_ORDER } from '../utils/moleculer/moleculer.constants';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../utils/config.schema';
import { JwtStrategy } from '../auth/jwt.strategy';
import { OrderController } from './order.controller';

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [
    JwtStrategy,
    {
      provide: SERVICE_ORDER,
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
          // Add other options from your brokerConfig if needed
        });
        await broker.start();
        return broker;
      },
    },
  ],
})
export class OrderModule {}

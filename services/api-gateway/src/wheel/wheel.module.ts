import * as os from 'os';
import { Module } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import { SERVICE_WHEEL } from '../utils/moleculer/moleculer.constants';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../utils/config.schema';
import { JwtStrategy } from '../auth/jwt.strategy';
import { WheelController } from './wheel.controller';
// import { MoleculerAdapter } from '../moleculer/adapter';

@Module({
  imports: [],
  controllers: [WheelController],
  providers: [
    JwtStrategy,
    {
      provide: SERVICE_WHEEL,
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
export class WheelModule {}

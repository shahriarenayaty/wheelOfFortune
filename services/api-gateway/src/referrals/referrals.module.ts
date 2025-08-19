import * as os from 'os';
import { Module } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import { SERVICE_GAMIFICATION } from '../utils/moleculer/moleculer.constants';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../utils/config.schema';
import { ReferralsController } from './referrals.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
// import { MoleculerAdapter } from '../moleculer/adapter';

@Module({
  imports: [],
  controllers: [ReferralsController],
  providers: [
    JwtStrategy,
    {
      provide: SERVICE_GAMIFICATION,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvConfig>) => {
        const broker = new ServiceBroker({
          nodeID: `${configService.get('NODE_ID_PREFIX')}-${os.hostname().toLowerCase()}-${process.pid}-2`,
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
export class ReferralsModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { configValidationSchema } from './utils/config.schema';
import { validateSchema } from './utils/config.schema';
import { ReferralsModule } from './referrals/referrals.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateSchema,
      isGlobal: true,
    }),
    AuthModule,
    ReferralsModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

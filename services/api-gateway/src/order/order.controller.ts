import {
  Controller,
  Inject,
  Post,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user-id.decorator';
import { IUser } from '../auth/jwt.strategy';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_ORDER,
} from '../utils/moleculer/moleculer.constants';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(@Inject(SERVICE_ORDER) private broker: ServiceBroker) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @GetUser() user: IUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.broker.call(MoleculerActions.ORDER.CREATE, createOrderDto, {
      meta: { user },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':orderId/payment')
  async simulatePayment(
    @GetUser() user: IUser,
    @Param('orderId') orderId: string,
  ) {
    const payload = { orderId };
    return this.broker.call(MoleculerActions.ORDER.PAY, payload, {
      meta: { user },
    });
  }
}

import {
  Controller,
  Inject,
  Post,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetToken } from '../auth/get-token.decorator';
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
    @GetToken() token: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.broker.call(MoleculerActions.ORDER.CREATE, createOrderDto, {
      meta: { token },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':orderId/payment')
  async simulatePayment(
    @GetToken() token: string,
    @Param('orderId') orderId: string,
  ) {
    const payload = { orderId };
    return this.broker.call(MoleculerActions.ORDER.PAY, payload, {
      meta: { token },
    });
  }
}

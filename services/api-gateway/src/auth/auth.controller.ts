import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ServiceBroker } from 'moleculer';
import {
  MoleculerActions,
  SERVICE_AUTH,
} from '../utils/moleculer/moleculer.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(SERVICE_AUTH) private broker: ServiceBroker) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.broker.call(MoleculerActions.AUTH.LOGIN, loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.broker.call(MoleculerActions.AUTH.REGISTER, registerDto);
  }
}

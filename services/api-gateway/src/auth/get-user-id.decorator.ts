import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from './jwt.strategy';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): IUser => {
    const context = ctx.switchToHttp();
    const request = context.getRequest();
    return request.user;
  },
);

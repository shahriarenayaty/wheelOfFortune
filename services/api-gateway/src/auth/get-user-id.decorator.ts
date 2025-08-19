import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from './jwt.strategy';

export const GetUserId = createParamDecorator(
  (_data, ctx: ExecutionContext): IUser => {
    const context = ctx.switchToHttp();
    const request = context.getRequest();
    return request.user;
  },
);

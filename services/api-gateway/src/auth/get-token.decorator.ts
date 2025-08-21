import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetToken = createParamDecorator(
  (_data, ctx: ExecutionContext): string => {
    const context = ctx.switchToHttp();
    const request = context.getRequest();
    const headers = request.headers;
    let token = '';
    if (headers.authorization) {
      token = headers.authorization;
      token = token.replace('Bearer ', '');
    }
    return token;
  },
);

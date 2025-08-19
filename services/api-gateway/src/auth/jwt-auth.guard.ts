import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

// The string 'jwt' here corresponds to the default name of the strategy
// registered by PassportStrategy(Strategy).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const headers = request.headers;
    if (!headers.authorization) {
      throw new UnauthorizedException('mest send token');
    }
    const token = headers.authorization;
    if (!token.startsWith('Bearer ')) {
      throw new UnauthorizedException('token must start with Bearer');
    }
    return super.canActivate(context);
  }
}

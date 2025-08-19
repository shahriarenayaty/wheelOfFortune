import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface IUser {
  userId: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // 1. Where to find the token in the request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. We don't allow expired tokens
      ignoreExpiration: false,

      // 3. THE CRUCIAL PART: Provide the same secret for verification.
      //    It reads the secret from the environment variables injected by Docker Compose.
      secretOrKey: process.env.JWT_SECRET || 'SHAHRIAR',
    });
  }

  /**
   * This `validate` method is called ONLY AFTER the token's signature
   * and expiration have been successfully verified against the secret.
   *
   * Its job is to take the decrypted payload and return a user object,
   * which NestJS will then attach to the `Request` object as `req.user`.
   */
  async validate(payload: any): Promise<IUser> {
    // The payload is the object we originally signed in the Auth Service.
    // { userId: '...', phone: '...' }
    return { userId: payload.userId };
  }
}

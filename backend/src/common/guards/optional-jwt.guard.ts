import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtGuard, but does not throw if no/invalid token is provided.
 * request.user is simply undefined for anonymous requests.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    return user || (undefined as TUser);
  }
}

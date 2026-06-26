import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Class (not interface) so it can be referenced in decorated
// controller signatures with emitDecoratorMetadata enabled.
export class JwtUser {
  sub: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUser }>();
    return request.user;
  },
);

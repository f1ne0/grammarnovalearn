import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  type?: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  /**
   * No DB hit per request — trust the signed token.
   * Role is embedded in the token at login/register/refresh.
   */
  validate(payload: JwtPayload) {
    // A refresh token must never authenticate a normal request.
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role ?? 'STUDENT',
    };
  }
}

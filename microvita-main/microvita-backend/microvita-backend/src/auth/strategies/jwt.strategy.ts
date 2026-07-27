import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
  console.log('JWT Payload:', payload);

  const user = await this.authService.validateUser(payload.sub);
  if (!user) {
    throw new UnauthorizedException();
  }

  return {
    userId: payload.sub,
    id: payload.sub,
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
}
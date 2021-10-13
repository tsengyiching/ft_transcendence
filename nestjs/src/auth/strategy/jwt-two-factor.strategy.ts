import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(configService: ConfigService) {
    const extractJwtFromCookie = (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['jwt-two-factor'];
      }
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  extractJwtFromCookie(req: Request) {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['jwt-two-factor'];
    }
    return token;
  }

  async validate(payload: JwtPayload) {
    if (!payload.twoFA) {
      return payload;
    }
    if (payload.twoFA) {
      return payload;
    }
  }
}

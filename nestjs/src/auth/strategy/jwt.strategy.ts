import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/service/user.service';
import { Request, Response } from 'express';
import { WsException } from '@nestjs/websockets';

export type JwtPayload = {
  id: number;
  username: string;
  email: string;
  twoFA: boolean;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: (req: Request): string => {
        let tokenJwt = null;

        if (req && req.cookies) {
          tokenJwt = req.cookies['jwt'];
        }
        return tokenJwt || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const bannedIds = await this.userService.getBannedUserIds();
    if (!bannedIds.includes(payload.id)) {
      return {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        twoFA: payload.twoFA,
      };
    }
  }
}

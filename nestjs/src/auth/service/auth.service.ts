import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../strategy/jwt.strategy';

import { User } from 'src/user/model/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: User) {
    const payload: JwtPayload = { username: user.nickname, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

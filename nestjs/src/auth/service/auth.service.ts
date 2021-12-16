import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { JwtPayload } from '../strategy/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  login(user: User, isSecondFactorAuthenticated = false) {
    const payload: JwtPayload = {
      username: user.nickname,
      id: user.id,
      email: user.email,
      twoFA: isSecondFactorAuthenticated,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  getPayloadFromAuthenticationToken(cookie: string): JwtPayload {
    const jwtToken = parse(cookie).jwt;
    // jwt two factor
    const payload: JwtPayload = this.jwtService.verify(jwtToken, {
      secret: process.env.JWT_SECRET,
    });
    //console.log('payload', payload);
    return payload;
  }

  async getUserFromSocket(client: Socket): Promise<User> {
    const cookie = client.handshake.headers.cookie;
    //'console.log('cookie', cookie);
    const payload = this.getPayloadFromAuthenticationToken(cookie);
    const user = await this.userService.getOneById(payload.id);
    if (!user) throw new WsException('Invalid credentials.');
    return user;
  }
}

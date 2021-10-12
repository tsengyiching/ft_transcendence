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

  login(user: User) {
    const payload: JwtPayload = {
      username: user.nickname,
      id: user.id,
      email: user.email,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  public async getUserFromAuthenticationToken(token: string) {
    const payload: JwtPayload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    if (payload.id) {
      return this.userService.getOneById(payload.id);
    }
  }

  async getUserFromSocket(socket: Socket) {
    const cookie = socket.handshake.headers.cookie;

    if (!cookie) throw new WsException('Unauthorized');

    const user: User = await this.getUserFromAuthenticationToken(
      parse(cookie).jwt,
    );
    if (!user) throw new WsException('Invalid credentials.');
    return user;
  }
}

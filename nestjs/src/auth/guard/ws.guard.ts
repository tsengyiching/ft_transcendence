import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/service/user.service';
import { AuthService } from '../service/auth.service';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bannedIds = await this.userService.getBannedUserIds();
    const bearerToken: string = context.switchToHttp().getRequest().handshake
      .headers.cookie;
    const jwt = 'jwt=';
    const twofa = 'jwt-two-factor=';
    const niddleJWT = bearerToken.indexOf(jwt);
    const niddleTwoFA = bearerToken.indexOf(twofa);
    let jwtToken: string, twofaToken: string;
    if (niddleJWT === -1) {
      jwtToken = bearerToken.slice(niddleJWT + jwt.length);
      twofaToken = null;
    } else {
      jwtToken = bearerToken.slice(niddleJWT + jwt.length, niddleTwoFA - 2);
      twofaToken = bearerToken.slice(niddleTwoFA + twofa.length);
    }
    try {
      const user = await this.authService.getUserFromAuthenticationToken(
        jwtToken,
      );
      if (twofaToken) {
        await this.authService.getUserFromAuthenticationToken(twofaToken);
      }
      if (user && !bannedIds.includes(user.id)) return true;
      else return false;
    } catch (err) {
      return false;
    }
  }
}

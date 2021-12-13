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
    const niddle = bearerToken.indexOf('jwt=');
    const jwt = bearerToken.slice(niddle + 4);
    try {
      const user = await this.authService.getUserFromAuthenticationToken(jwt);
      if (user && !bannedIds.includes(user.id)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }
}

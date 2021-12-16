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
    //console.log('bearerToken', bearerToken);
    try {
      const payload =
        this.authService.getPayloadFromAuthenticationToken(bearerToken);
      const user = await this.userService.getOneById(payload.id);
      if (user && !bannedIds.includes(user.id)) return true;
      else return false;
    } catch (err) {
      return false;
    }
  }
}

import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  HttpCode,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/model/user.entity';
import { CurrentUser } from '../decorator/currrent.user.decorator';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { TwoFactorAuthService } from '../service/two-factor-auth.service';
import { Response } from 'express';
import { TwoFactorAuthCodeDto } from '../model/twoFactorAuthenticationCode.dto';
import { UserService } from 'src/user/service/user.service';
import { AuthService } from '../service/auth.service';
import { JwtPayload } from '../strategy/jwt.strategy';

@Controller('2fa')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('generate')
  async register(@Res() response: Response, @CurrentUser() user: User) {
    const { otpauthUrl } =
      await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
        user,
      );
    return this.twoFactorAuthService.pipeQrCodeStream(response, otpauthUrl);
  }

  @Post('turn-on')
  @HttpCode(200)
  async turnOnTwoFactorAuthentication(
    @CurrentUser() user: User,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthCodeDto,
  ) {
    const isCodeValid =
      this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFactorAuthentication(user.id);
  }

  @Post('authenticate')
  @HttpCode(200)
  async authenticate(
    @CurrentUser() userPayload: JwtPayload,
    @Body() twoFactorAuthCode: TwoFactorAuthCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.getOneById(userPayload.id);
    const isCodeValid =
      this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthCode.twoFactorAuthenticationCode,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const { accessToken } = this.authService.login(user, true);
    console.log({ accessToken });
    res.cookie('jwt-two-factor', { accessToken });
    userPayload.twoFA = true;
    //request.res.setHeader('Set-Cookie', [accessTokenCookie]);
    return userPayload;
  }
}

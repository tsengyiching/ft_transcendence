import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/user/model/user.entity';
import { CurrentUser } from '../decorator/currrent.user.decorator';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { TwoFactorAuthService } from '../service/two-factor-auth.service';
import { Response } from 'express';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @CurrentUser() user: User) {
    console.log(user);
    const { otpauthUrl } =
      await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
        user,
      );

    return this.twoFactorAuthService.pipeQrCodeStream(response, otpauthUrl);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'ft_trancendence',
      secret,
    );
    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
    return { secret, otpauthUrl };
  }

  public async pipeQrCodeStream(
    stream: Response,
    otpauthUrl: string,
  ): Promise<any> {
    return toFileStream(stream, otpauthUrl);
  }

  public async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ): Promise<boolean> {
    const userData = await this.userService.getOneById(user.id);
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: userData.twoFactorAuthenticationSecret,
    });
  }
}

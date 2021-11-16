import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { JwtTwoFactorGuard } from 'src/auth/guard/jwt-two-factor.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { BanUserDto } from './dto/ban-user.dto';
import { SetUserSiteStatusDto } from './dto/set-user-site-status.dto';

@UseGuards(JwtAuthGuard)
@UseGuards(JwtTwoFactorGuard)
@Controller('admin')
export class AdminController {
  constructor(private userService: UserService) {}

  @Get('list')
  getUserlist(
    @CurrentUser() user: User,
    @Query('status') status: string,
  ): Promise<User[]> {
    return this.userService.getUsersWithSiteStatus(user.id, status);
  }

  @Patch('set')
  modifySiteStatus(
    @CurrentUser() user: User,
    @Body() setUserSiteStatusDto: SetUserSiteStatusDto,
  ): Promise<User> {
    return this.userService.modifyUserSiteStatus(user.id, setUserSiteStatusDto);
  }

  @Patch('ban')
  async banUserFromSite(
    @CurrentUser() user: User,
    @Body() banUserDto: BanUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    if (user.id === banUserDto.id) {
      throw new HttpException(
        `You cannot modify your own site status !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const [operator, banned] = await Promise.all([
      this.userService.getOneById(user.id),
      this.userService.getOneById(banUserDto.id),
    ]);
    return this.userService.ban(operator, banned, res);
  }
}

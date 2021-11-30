import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { JwtTwoFactorGuard } from 'src/auth/guard/jwt-two-factor.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
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
    @CurrentUser() operator: User,
    @Body() setUserSiteStatusDto: SetUserSiteStatusDto,
  ): Promise<User> {
    return this.userService.modifyUserSiteStatus(
      operator.id,
      setUserSiteStatusDto,
    );
  }
}

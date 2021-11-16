import { Controller, UseGuards } from '@nestjs/common';
import { JwtTwoFactorGuard } from 'src/auth/guard/jwt-two-factor.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { UserService } from 'src/user/service/user.service';

@UseGuards(JwtAuthGuard)
@UseGuards(JwtTwoFactorGuard)
@Controller('admin')
export class AdminController {
  constructor(private userService: UserService) {}
}

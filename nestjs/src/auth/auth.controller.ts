import {
	Controller,
	Get,
	Req,
	Res,
	UseGuards,
  } from '@nestjs/common';
  
  
  import { Request, Response } from 'express';
  import { User } from 'src/user/model/user.entity';
  
  import { AuthService } from './auth.service';
  import { FortyTwoAuthGuard as FortyTwoGuard } from './guard/42.guard';
  import { JwtAuthGuard } from './guard/jwt.guard';
  
  @Controller('auth')
  export class AuthController {
	constructor(
	  private authService: AuthService
	) {}
  
	@Get('42/callback')
	@UseGuards(FortyTwoGuard)
	async fortyTwoCallback(@Req() req: Request, @Res() res: Response): Promise<User> {
	  const { accessToken } = this.authService.login(req.user);
	  res.cookie('jwt', accessToken);
	  res.send(req.user); // ! Bad thing to fix later
	  return req.user;
	}
  
	@Get('login')
	@UseGuards(FortyTwoGuard)
	async getLogin() {
	  // Redirect to authentication pipeline
	}
    
}

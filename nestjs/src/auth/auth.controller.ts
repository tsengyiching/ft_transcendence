import {
	Controller,
	Get,
	Req,
	UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { User } from 'src/user/model/user.entity';

import { UserService } from 'src/user/service/user.service';

@Controller('auth')
export class AuthController {
	constructor(private userService: UserService) {}

	// @Get('/auth/42/callback')
	// async getUsers(): Promise<User[]> {
	// 	return this.userService.getAll();
	// }

	@Get('42/callback')
	@UseGuards(AuthGuard('forty-two'))
	async getUserFromDiscordLogin(@Req() req): Promise<any> {
		console.log(req);
		return req.user;
	}


	@Get('login')
	@UseGuards(AuthGuard('forty-two'))
	async getLogin(): Promise<any> {
		return NaN;
	}
}


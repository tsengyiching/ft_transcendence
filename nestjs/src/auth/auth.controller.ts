import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
} from '@nestjs/common';

import { get } from 'http';
import { User } from 'src/user/model/user.entity';

import { UserService } from 'src/user/service/user.service';

@Controller('auth')
export class AuthController {
	constructor(private userService: UserService) {}

	@get('/auth/42/callback');
	getUsers(): Promise<User[]> {
		return this.userService.getAll();
	}

}


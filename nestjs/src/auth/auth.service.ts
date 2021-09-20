import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/model/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
	) {}

	login(user: User) {
		const payload: JwtPayload = { username: user.nickname, sub: user.id };
		return {
			accessToken: this.jwtService.sign(payload),
		};
	}
}

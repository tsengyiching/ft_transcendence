import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/model/user.entity';
import { Repository } from 'typeorm';

//   - `provider`         always set to `42`
//   - `id`               the user's 42 ID
//   - `username`         the user's 42 xlogin
//   - `displayName`      the user's full name
//   - `name.familyName`  the user's last name
//   - `name.givenName`   the user's first name
//   - `profileUrl`       the URL of the profile for the user on 42 intra
//   - `emails`           the user's email address
//   - `photos      `     the user's photo
//   - `phoneNumbers`     the user's phone number

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User) private userRepository: Repository<User>,
	) {}

	createUser(accessToken: string, refreshToken: string, profile: any, cb :any): Promise<User> {
		const newUser = this.userRepository.create();
		newUser.id = profile.id;
		newUser.nickname = profile.username;
		// newUser.avatar = profile.photos;

		return this.userRepository.save(newUser);
	}

}

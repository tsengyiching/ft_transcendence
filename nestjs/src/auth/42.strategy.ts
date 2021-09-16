import { PassportStrategy } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import {
	Injectable, UnauthorizedException,
} from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';
import { lastValueFrom } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/model/user.entity';
import { AuthService } from './auth.service';

// change these to be your 42 client ID and secret
const clientID = process.env.OAUTH_42_APP_ID;
const clientSecret = process.env.OAUTH_42_APP_SECRET;
const callbackURL = 'http://127.0.0.1:8080/auth/42/callback';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'forty-two')
{
	constructor(
		private UserServices: UserService,
		private AuthServices: AuthService,
		private http: HttpService,
	) {
		// https://api.intra.42.fr/oauth/authorize?client_id=your_very_long_client_id&redirect_uri=http%3A%2F%2Flocalhost%3A1919%2Fusers%2Fauth%2Fft%2Fcallback&response_type=code&scope=public&state=a_very_long_random_string_witchmust_be_unguessable'
		super({
			authorizationURL:	`https://api.intra.42.fr/oauth/authorize?${ stringify({
				client_id		: clientID,
				redirect_uri	: callbackURL,
				response_type	: 'code',
				scope			: 'public',
				state			: '54v4646v54dsdfjkhjksdjskfnjksdjkfds8f2s'
			}) }`,
			tokenURL		: 'https://api.intra.42.fr/oauth/token',
			scope			: 'public',
			clientID,
			clientSecret,
			callbackURL
		});
	}

	async validate(
		accessToken: string,
	): Promise<any> {
		const { data } = await lastValueFrom(this.http.get('https://api.intra.42.fr/v2/me', {
				headers: { Authorization: `Bearer ${ accessToken }` },
			}));
		
		if (!data)
			throw new UnauthorizedException();

		let user = await this.UserServices.getOneById(data.id);
		if (!user)
			user = await this.AuthServices.createUser(data);
		
		return (user);
	}
}

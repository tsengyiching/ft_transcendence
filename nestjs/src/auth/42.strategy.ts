// import { FortyTwoStrategy } from 'passport-42';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from './auth.service';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(FortyTwoStrategy) {
//   constructor(private authService: AuthService) {
//     super();
//   }
// }


// passport.use(new FortyTwoStrategy({
//   clientID: process.env.OAUTH_42_APP_ID,
//   clientSecret: process.env.OAUTH_42_APP_SECRET,
//   callbackURL: "http://127.0.0.1:8080/auth/42/callback"
// },

// function(accessToken, refreshToken, profile, cb) {
//   User.findOrCreate({ fortytwoId: profile.id }, function (err, user) {
//     return cb(err, user);
//   });
// }
// ));


import { PassportStrategy } from '@nestjs/passport';
import {
	HttpService,
	Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';

// change these to be your Discord client ID and secret
const clientID = 'insert-client-id';
const clientSecret = 'insert-client-secret';
const callbackURL = 'http://localhost:8080/auth/42/callback';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'forty-two')
{
	constructor(
		private authService: AuthService,
		private http: HttpService,
	) {
		super({
			authorizationURL: `https://discordapp.com/api/oauth2/authorize?${ stringify({
				client_id    : clientID,
				redirect_uri : callbackURL,
				response_type: 'code',
				scope        : 'identify',
			}) }`,
			tokenURL        : 'https://discordapp.com/api/oauth2/token',
			scope           : 'identify',
			clientID,
			clientSecret,
			callbackURL,
		});
	}

	async validate(
		accessToken: string,
	): Promise<any> {
		const { data } = await this.http.get('https://discordapp.com/api/users/@me', {
				headers: { Authorization: `Bearer ${ accessToken }` },
			})
			.toPromise();

		return this.authService.findUserFromDiscordId(data.id);
	}
}

import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';
import { Strategy } from 'passport-42';

import { UserModule } from 'src/user/user.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';


@Module({
  imports: [UserModule, PassportModule, Strategy({
	clientID: process.env.OAUTH_42_APP_ID,
	clientSecret: process.env.OAUTH_42_APP_SECRET,
	callbackURL: "http://127.0.0.1:8080/auth/42/callback"
  })],

  providers: [AuthService],
  controllers: [AuthController]
})

export class AuthModule {
    constructor(private passport: PassportModule, private strategy: Startegy) {
		passport.use(strategy);
	}
}

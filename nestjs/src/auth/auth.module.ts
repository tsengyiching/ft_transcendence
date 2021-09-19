import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';

import { UserModule } from 'src/user/user.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './42.strategy';
import { UserService } from 'src/user/service/user.service';
import { HttpModule } from '@nestjs/axios';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/model/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from './jwt.strategy';


@Module({
  imports: [
		HttpModule,
		UserModule,
		PassportModule,
		TypeOrmModule.forFeature([User]),
		JwtModule.registerAsync({
		useFactory: async (configService: ConfigService) => {
			return {
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
				expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
				},
		  };
		},
		inject: [ConfigService],
	  }),
	],

	providers: [AuthService, FortyTwoStrategy, JwtAuthStrategy],
	controllers: [AuthController],
	exports: [JwtModule, AuthModule]
})

export class AuthModule {
}

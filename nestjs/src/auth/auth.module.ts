import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';

import { UserModule } from 'src/user/user.module';

import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { FortyTwoStrategy } from '../strategy/42.strategy';
import { HttpModule } from '@nestjs/axios';

import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from '../strategy/jwt.strategy';

@Module({
  imports: [
    HttpModule,
    UserModule,
    PassportModule,
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
  exports: [AuthModule],
})
export class AuthModule {}

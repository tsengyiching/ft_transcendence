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


@Module({
  imports: [HttpModule, UserModule, PassportModule, TypeOrmModule.forFeature([User])],

  providers: [AuthService, FortyTwoStrategy],
  controllers: [AuthController]
})

export class AuthModule {
}

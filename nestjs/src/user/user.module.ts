import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), GameModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

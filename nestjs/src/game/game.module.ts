import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { GameController } from './controller/game.controller';
import { Game } from './model/game.entity';
import { GameService } from './service/game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), UserModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}

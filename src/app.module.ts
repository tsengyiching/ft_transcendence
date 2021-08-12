import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HomeModule } from './home/home.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [HomeModule, GameModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

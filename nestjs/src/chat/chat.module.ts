import { ChatService } from './service/chat.service';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { ChanelGateway } from './gateway/chanel.gateway';
import { ChatGateway } from './gateway/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chanel } from './model/chanel.entity';
import { Message } from './model/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chanel, Message]),
    UserModule,
    GameModule,
    AuthModule,
  ],
  providers: [ChatService, ChatGateway, ChanelGateway],
  exports: [ChatModule],
})
export class ChatModule {}

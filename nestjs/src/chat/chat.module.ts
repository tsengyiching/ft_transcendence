import { ChatService } from './service/chat.service';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { ChannelGateway } from './gateway/channel.gateway';
import { ChatGateway } from './gateway/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './model/channel.entity';
import { Message } from './model/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message]),
    UserModule,
    GameModule,
    AuthModule,
  ],
  providers: [ChatService, ChatGateway, ChannelGateway],
  exports: [ChatModule],
})
export class ChatModule {}

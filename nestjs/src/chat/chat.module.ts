import { ChatService } from './service/chat.service';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './gateway/chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './model/channel.entity';
import { Message } from './model/messages.entity';
import { ChannelParticipant } from './model/channelParticipant.entity';
import { MessageService } from './service/message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelParticipant, Message]),
    UserModule,
    GameModule,
    AuthModule,
  ],
  providers: [ChatService, MessageService, ChatGateway],
  exports: [ChatModule],
})
export class ChatModule {}

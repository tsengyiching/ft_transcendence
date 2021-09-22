import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { ChanelGateway } from './gateway/chanel.gateway';

@Module({
  imports: [UserModule, GameModule, AuthModule],
  providers: [ChanelGateway],
  exports: [ChatModule],
})
export class ChatModule {}

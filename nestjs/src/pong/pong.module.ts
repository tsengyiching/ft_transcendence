import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.game.service';
import { PongUsersService } from './pong.users.service';

@Module({
  providers: [PongGateway, PongService, PongUsersService],
})
export class PongModule {}

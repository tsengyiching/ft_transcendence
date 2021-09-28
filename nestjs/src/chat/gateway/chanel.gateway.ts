import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/user/model/user.entity';

@UseGuards(JwtAuthGuard)
@WebSocketGateway({
  namespace: 'chanel',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChanelGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: any;

  afterInit(server: any) {}

  handleConnection(client: any, ...args: any[]) {
    this.server.emit('message', 'User left');
    console.log('User connected');
  }

  handleDisconnect(client: any) {
    console.log('User disconnected');
  }

  @SubscribeMessage('message') handleEvent(@MessageBody() messages: string) {
    this.server.emit('message', messages);
    console.log(messages);
  }
}

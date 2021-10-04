import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { AuthService } from 'src/auth/service/auth.service';
import { ChatService } from '../service/chat.service';

@WebSocketGateway({
  namespace: 'channel',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChannelGateway {
  @WebSocketServer() server: any;

  constructor(
    private readonly chatService: ChatService,
    private authService: AuthService,
  ) {}

  handleConnection(client: Socket, ...args: any[]) {
    this.server.emit('message', 'User left');
    const user = this.authService.getUserFromSocket(client);
    console.log(user);
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

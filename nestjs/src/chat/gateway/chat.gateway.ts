/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { CreateChanelDto } from '../model/chanel.dto';
import { ChatService } from '../service/chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: any;

  constructor(
    private readonly chatService: ChatService,
    private authService: AuthService,
  ) {}

  /**
   * Call after socket creation
   * @param server
   */
  afterInit(server: any) {
    // console.log('Socket is live');
  }

  /**
   * Call After new client connection
   * @param client
   * @param args
   */
  handleConnection(client: Socket, ...args: any[]) {
    console.log('New User Join');
    const user = this.authService.getUserFromSocket(client);
    this.server.emit('user-join', { user });
  }

  /**
   * Call After client leave
   * @param client
   */
  handleDisconnect(client: any) {
    console.log('Remove active user');
  }

  /**
   * create chanel
   * @param data
   */
  @SubscribeMessage('chanel_create')
  async createChanel(@MessageBody() data: CreateChanelDto) {
    console.log('Chanel Create');
    console.log(data);
    const chanel = await this.chatService.createChanelWithDto(data);
    console.log(chanel);
    this.server.emit('chanel_new', chanel);
  }

  /**
   * delete chanel
   * @param data
   */
  @SubscribeMessage('chanel_delete')
  deleteChanel(@MessageBody() data: CreateChanelDto) {
    console.log('Chanel Create');
    console.log(data);
    const chanel = this.chatService.createChanelWithDto(data);
    console.log(chanel);
    this.server.emit('chanel-new', chanel);
  }

  /**
   * join chanel
   * @param data
   */
  @SubscribeMessage('join-chanel')
  JoinChanel(@MessageBody() data: string) {
    this.server.emit('events', data);
  }

  @SubscribeMessage('message') handleEvent(@MessageBody() messages: string) {
    this.server.emit('message', messages);
    console.log(messages);
  }
}

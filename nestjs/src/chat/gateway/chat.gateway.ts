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
import { CreateChannelDto } from '../model/channel.dto';
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
   * create channel
   * @param data
   */
  @SubscribeMessage('channel_create')
  async createChannel(@MessageBody() data: CreateChannelDto) {
    console.log('Channel Create');
    console.log(data);
    const channel = await this.chatService.createChannelWithDto(data);
    console.log(channel);
    this.server.emit('channel_new', channel);
  }

  /**
   * delete channel
   * @param data
   */
  @SubscribeMessage('channel_delete')
  deleteChannel(@MessageBody() data: CreateChannelDto) {
    console.log('Channel Create');
    console.log(data);
    const channel = this.chatService.createChannelWithDto(data);
    console.log(channel);
    this.server.emit('channel-new', channel);
  }

  /**
   * join channel
   * @param data
   */
  @SubscribeMessage('join-channel')
  JoinChannel(@MessageBody() data: string) {
    this.server.emit('events', data);
  }

  @SubscribeMessage('message') handleEvent(@MessageBody() messages: string) {
    this.server.emit('message', messages);
    console.log(messages);
  }
}

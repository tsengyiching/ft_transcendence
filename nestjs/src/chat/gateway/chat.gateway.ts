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
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { User } from 'src/user/model/user.entity';
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
  server: Server;

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
  async handleConnection(client: Socket, ...args: any[]) {
    console.log('New User Join');
    const user: User = await this.authService.getUserFromSocket(client);
    const chanels = this.chatService.getAllChannel();
    this.server.emit('user-join', user.id);
    this.server.emit('chanel-list', chanels);
    // console.log(await this.server.allSockets());
  }

  /**
   * Call After client leave
   * @param client
   */
  handleDisconnect(client: Socket) {
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
  deleteChannel(@MessageBody() data) {
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
    // this.server.emit('events', data);
  }

  /**
   * get channel message (with pagination systeme)
   * @param data
   */

  /**
   * channel send messages
   * @param data
   */
  @SubscribeMessage('message') handleEvent(@MessageBody() messages: string) {
    this.server.emit('message', messages);
    console.log(messages);
  }
}

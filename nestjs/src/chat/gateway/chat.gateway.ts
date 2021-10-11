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
import { CreateChannelDto } from '../dto/channel.dto';
import { CreateChannelParticipantDto } from '../dto/create-channel-participant.dto';
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
    const channels = await this.chatService.getChannelUserParticipate(user.id);
    this.server.emit('user-join', user.id);
    this.server.emit('channel-list', channels);
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
   * Create channel
   * @param data
   */
  @SubscribeMessage('channel_create')
  async createChannel(client: Socket, data: CreateChannelDto) {
    console.log('Channel Create');
    const user = await this.authService.getUserFromSocket(client);
    const channel = await this.chatService.createChannel(user.id, data);
    console.log(channel);
    this.server.emit('channel_new', channel);
  }

  /**
   * delete channel
   * @param data
   */
  @SubscribeMessage('channel_delete')
  deleteChannel(@MessageBody() data) {
    console.log('Channel Delete');
    console.log(data);
  }

  /**
   * join channel
   * @param data
   */
  @SubscribeMessage('channel-join')
  async JoinChannel(
    client: Socket,
    @MessageBody() channelParticipant: CreateChannelParticipantDto,
  ) {
    const user = await this.authService.getUserFromSocket(client);
    this.chatService.addChannelParticipant(user.id, channelParticipant);
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

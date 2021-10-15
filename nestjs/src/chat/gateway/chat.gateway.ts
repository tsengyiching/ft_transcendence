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
import { CreateMessageDto } from '../dto/create-message.dto';
import { ChatService } from '../service/chat.service';
import { MessageService } from '../service/message.service';

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
    private readonly messageService: MessageService,
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
    this.server.emit('user-join', user.id);
    const channels_in = this.chatService.getChannelUserParticipate(user.id);
    const channels_out = this.chatService.getChannelUserNotParticipate(user.id);
    client.emit('channels-user-in', await channels_in);
    client.emit('channels-user-out', await channels_out);
    console.log(await this.messageService.getDirectMessages(user.id, 1));
  }

  /**
   * Call After client leave
   * @param client
   */
  async handleDisconnect(client: Socket) {
    console.log('Remove active user');
    const user: User = await this.authService.getUserFromSocket(client);
    this.server.emit('user-leave', user.id);
  }

  /**
   * Create channel
   * @param data
   */
  @SubscribeMessage('channel_create')
  async createChannel(client: Socket, data: CreateChannelDto) {
    console.log('Channel Create');
    const user = await this.authService.getUserFromSocket(client);
    await this.chatService.createChannel(user.id, data);
	
    // const channels_in = this.chatService.getChannelUserParticipate(user.id);
    // const channels_out = this.chatService.getChannelUserNotParticipate(user.id);
    // this.server.emit('channels-user-in', await channels_in);
    // this.server.emit('channel-user-out', await channels_out);
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
    channelParticipant: CreateChannelParticipantDto,
  ) {
    const user = await this.authService.getUserFromSocket(client);
    this.chatService.addChannelParticipant(user.id, channelParticipant);
  }

  /**
   * Load channel data (message) and register to the room event
   * @param data
   */
  @SubscribeMessage('channel-load')
  async loadChannel(client: Socket, @MessageBody() channelID: number) {
    const user = await this.authService.getUserFromSocket(client);
    client.join('channel-' + channelID);
  }

  /**
   * Unload Channel data
   * @param data
   */
  @SubscribeMessage('channel-unload')
  async unloadChannel(client: Socket, @MessageBody() channelID: number) {
    client.leave('channel-' + channelID);
  }

  /**
   * channel send messages
   * @param data
   */
  @SubscribeMessage('channel-message')
  async newChannelMessage(client: Socket, message: CreateMessageDto) {
    const user: User = await this.authService.getUserFromSocket(client);
    // Save message in db
    this.messageService.createChannelMessage(user.id, message);
    // Send message to all people connected in channel
    this.server.to('channel-' + message.channelId).emit('message', message);
  }
}

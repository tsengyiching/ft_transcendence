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
import { UserService } from 'src/user/service/user.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { CreateChannelParticipantDto } from '../dto/create-channel-participant.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { LeaveChannelDto } from '../dto/leave-channel.dto';
import { ChatService } from '../service/chat.service';
import { MessageService } from '../service/message.service';
import { CreateDirectDto } from '../dto/create-direct.dto';

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
    private authService: AuthService,
    private userService: UserService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
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
    const channels_in = this.chatService.getUserChannels(user.id);
    const channels_out = this.chatService.getUserNotParticipateChannels(
      user.id,
    );
    client.emit('channels-user-in', await channels_in);
    client.emit('channels-user-out', await channels_out);
    //console.log(await this.messageService.getDirectMessages(user.id, 1));
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
   * @param CreateChannelDto : channel name and password
   */
  @SubscribeMessage('channel-create')
  async createChannel(client: Socket, data: CreateChannelDto) {
    const user = await this.authService.getUserFromSocket(client);
    await this.chatService.createChannel(user.id, data);
    console.log('Channel created successfully !');
    this.server.emit('channel-need-reload');
  }

  /**
   * Ask to Reload the Channels list
   */
  @SubscribeMessage('ask-reload-channel')
  async reloadChannel(client: Socket) {
    const user: User = await this.authService.getUserFromSocket(client);
    const channels_in = this.chatService.getUserChannels(user.id);
    const channels_out = this.chatService.getUserNotParticipateChannels(
      user.id,
    );
    client.emit('channels-user-in', await channels_in);
    client.emit('channels-user-out', await channels_out);
  }

  /**
   * delete channel
   * @param data
   */
  @SubscribeMessage('channel-delete')
  deleteChannel(data) {
    console.log('Channel Delete');
    console.log(data);
  }

  /**
   * join channel
   * @param CreateChannelParticipantDto : channelId and password
   */
  @SubscribeMessage('channel-join')
  async joinChannel(
    client: Socket,
    channelParticipant: CreateChannelParticipantDto,
  ) {
    const user = await this.authService.getUserFromSocket(client);
    await this.chatService.joinChannel(user.id, channelParticipant);
    console.log('User joined channel successfully !');
    /* ? SEND USER JOINING MSG IN THE CHANNEL ? */
    const channels_in = this.chatService.getUserChannels(user.id);
    const channels_out = this.chatService.getUserNotParticipateChannels(
      user.id,
    );
    client.emit('channels-user-in', await channels_in);
    client.emit('channels-user-out', await channels_out);
  }

  /**
   * leave channel
   * @param LeaveChannelDto : channel id
   */
  @SubscribeMessage('channel-leave')
  async leaveChannel(client: Socket, leaveChannelDto: LeaveChannelDto) {
    const user = await this.authService.getUserFromSocket(client);
    console.log('leave', user, 'dto', leaveChannelDto);
    await this.chatService.leaveChannel(user.id, leaveChannelDto);
    console.log('User left channel successfully !');
    /* ? SEND USER LEAVING MSG IN THE CHANNEL ? */
    const channels_in = this.chatService.getUserChannels(user.id);
    const channels_out = this.chatService.getUserNotParticipateChannels(
      user.id,
    );
    client.emit('channels-user-in', await channels_in);
    client.emit('channels-user-out', await channels_out);
  }

  /**
   *
   */

  /**
   * Load channel data (message) and register to the room event
   * @param data
   */
  @SubscribeMessage('channel-load')
  async loadChannel(client: Socket, channelId: number) {
    const user = await this.authService.getUserFromSocket(client);
    if (user) {
      const channelParticipant =
        await this.chatService.getOneChannelParticipant(user.id, channelId);
      if (channelParticipant) client.join('channel-' + channelId);
    }
  }

  /**
   * Unload Channel data
   * @param data
   */
  @SubscribeMessage('channel-unload')
  async unloadChannel(client: Socket, channelId: number) {
    client.leave('channel-' + channelId);
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

  /****************************************************************************/
  /*                               Direct Channel                             */
  /****************************************************************************/

  /**
   * Create new direct channel
   * @param data
   */
  @SubscribeMessage('private-create')
  async createDirect(client: Socket, data: CreateDirectDto) {
    const user1 = await this.authService.getUserFromSocket(client);
    const user2 = await this.userService.getOneById(data.UserId);
    await this.chatService.createDirectChannel(user1, user2);
    console.log('Channel created successfully !');
    this.server.emit('private-need-reload');
  }

  /**
   * Load channel data (message) and register to the room event
   * @param data
   */
  @SubscribeMessage('direct-load')
  async loadDirect(client: Socket, channelID: number) {
    const user = await this.authService.getUserFromSocket(client);
    if (user) {
      const channelParticipant =
        await this.chatService.getOneChannelParticipant(user.id, channelID);
      if (channelParticipant) client.join('direct-' + channelID);
    }
  }

  /**
   * Unload Channel data
   * @param data
   */
  @SubscribeMessage('direct-unload')
  async unloadDirect(client: Socket, channelID: number) {
    client.leave('direct-' + channelID);
  }

  /**
   * channel send messages
   * @param data
   */
  @SubscribeMessage('direct-message')
  async newDirectMessage(client: Socket, message: CreateMessageDto) {
    const user: User = await this.authService.getUserFromSocket(client);
    // Save message in db
    this.messageService.createChannelMessage(user.id, message);
    // Send message to all people connected in channel
    this.server.to('direct-' + message.channelId).emit('message', message);
  }
}

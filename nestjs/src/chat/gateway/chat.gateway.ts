import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { OnlineStatus, User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { GeneralChannelDto } from '../dto/general-channel.dto';
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
    this.userService.resetUserStatus();
  }

  /**
   * Call After new client connection
   * @param client
   * @param args
   */
  async handleConnection(client: Socket, ...args: any[]) {
    console.log('New User Join');
    const user: User = await this.authService.getUserFromSocket(client);
    this.userService.setUserStatus(user.id, OnlineStatus.AVAILABLE);
    this.server.emit('reload-status', {
      user_id: user.id,
      status: OnlineStatus.AVAILABLE,
    });

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
    this.userService.setUserStatus(user.id, OnlineStatus.OFFLINE);
    this.server.emit('reload-status', {
      user_id: user.id,
      status: OnlineStatus.OFFLINE,
    });
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
   * join channel
   * @param GeneralChannelDto : channelId and password
   */
  @SubscribeMessage('channel-join')
  async joinChannel(client: Socket, channelDto: GeneralChannelDto) {
    const user = await this.authService.getUserFromSocket(client);
    await this.chatService.joinChannel(user.id, channelDto);
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
    // need to complete later; and leaveChannelDto -> channel Id
  }

  /**
   * get channel users
   * @param channel id
   */
  @SubscribeMessage('channel-users')
  async getChannelUsers(channelId: number) {
    await this.getChannelUsers(channelId);
    // check with Felix
  }

  /**
   * add Password
   * @param GeneralChannelDto : channelId and password
   */
  @SubscribeMessage('channel-add-password')
  async addChannelPassword(client: Socket, channelDto: GeneralChannelDto) {
    const user = await this.authService.getUserFromSocket(client);
    await this.chatService.addChannelPassword(user.id, channelDto);
    console.log('Channel password has been added successfully !');
    // check with Felix
  }

  /**
   * change Password
   * @param GeneralChannelDto : channelId and password
   */
  @SubscribeMessage('channel-change-password')
  async changeChannelPassword(client: Socket, channelDto: GeneralChannelDto) {
    const user = await this.authService.getUserFromSocket(client);
    await this.chatService.changeChannelPassword(user.id, channelDto);
    console.log('Channel password has been changed successfully !');
    // check with Felix
  }

  /**
   * delete Password
   * @param GeneralChannelDto : channelId and password
   */
  @SubscribeMessage('channel-delete-password')
  async deleteChannelPassword(client: Socket, channelId: number) {
    const user = await this.authService.getUserFromSocket(client);
    await this.chatService.deleteChannelPassword(user.id, channelId);
    console.log('Channel password has been deleted successfully !');
    // check with Felix
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
   * Ask to (Re)load the direct Channels list
   */
  @SubscribeMessage('private-ask-reload')
  async loadPrivate(client: Socket) {
    const user: User = await this.authService.getUserFromSocket(client);
    const direct = this.chatService.getDirectChannelList(user.id);
    client.emit('private-list', await direct);
  }

  /**
   * Load channel data (message) and register to the room event
   * @param data
   */
  @SubscribeMessage('private-load')
  async loadDirect(client: Socket, channelId: number) {
    const user = await this.authService.getUserFromSocket(client);
    if (user) {
      const channelParticipant =
        await this.chatService.getOneChannelParticipant(user.id, channelId);
      if (channelParticipant) {
        client.join('private-' + channelId);
        const messages = await this.messageService.getDirectMessages(channelId);
        client.emit('private-message-list', messages);
      }
    }
  }

  /**
   * Unload Channel data
   * @param data
   */
  @SubscribeMessage('private-unload')
  async unloadDirect(client: Socket, channelId: number) {
    client.leave('private-' + channelId);
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

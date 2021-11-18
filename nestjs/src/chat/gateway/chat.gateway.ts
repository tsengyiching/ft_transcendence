import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { OnlineStatus, User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { JoinChannelDto } from '../dto/join-channel.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { LeaveChannelDto } from '../dto/leave-channel.dto';
import { ChatService } from '../service/chat.service';
import { MessageService } from '../service/message.service';
import { LoadDirectDto } from '../dto/load-direct.dto';
import { SetChannelAdminDto } from '../dto/set-channel-admin.dto';
import { SetChannelPasswordDto } from '../dto/set-channel-password.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';

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
    try {
      this.userService.resetUserStatus();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Call After new client connection
   * @param client
   * @param args
   */
  async handleConnection(client: Socket) {
    try {
      console.log('New User Join');

      const user: User = await this.authService.getUserFromSocket(client);
      this.userService.setUserStatus(user.id, OnlineStatus.AVAILABLE);
      client.join('user-' + user.id);
      this.server.emit('reload-status', {
        user_id: user.id,
        status: OnlineStatus.AVAILABLE,
      });
      const [channels_in, channels_out] = await Promise.all([
        this.chatService.getUserChannels(user.id),
        this.chatService.getUserNotParticipateChannels(user.id),
      ]);
      client.emit('channels-user-in', channels_in);
      client.emit('channels-user-out', channels_out);
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * Call After client leave
   * @param client
   */
  async handleDisconnect(client: Socket) {
    try {
      console.log('Remove active user');
      const user: User = await this.authService.getUserFromSocket(client);
      await this.userService.setUserStatus(user.id, OnlineStatus.OFFLINE);
      client.leave('user-' + user.id);
      this.server.emit('reload-status', {
        user_id: user.id,
        status: OnlineStatus.OFFLINE,
      });
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * Create channel
   * @param CreateChannelDto : channel name and password
   */
  @SubscribeMessage('channel-create')
  async createChannel(client: Socket, data: CreateChannelDto) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.createChannel(user.id, data);
      console.log('Channel created successfully !');
      this.server.emit('channel-need-reload');
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * join channel
   * @param JoinChannelDto : channelId and password
   */
  @SubscribeMessage('channel-join')
  async joinChannel(client: Socket, channelDto: JoinChannelDto) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.joinChannel(user.id, channelDto);
      console.log('User joined channel successfully !');
      /* ? SEND USER JOINING MSG IN THE CHANNEL ? */

      const [channels_in, channels_out, users] = await Promise.all([
        this.chatService.getUserChannels(user.id),
        this.chatService.getUserNotParticipateChannels(user.id),
        this.chatService.getChannelUsers(channelDto.channelId),
      ]);

      this.server
        .to('channel-' + channelDto.channelId)
        .emit('channel-users', users);
      this.server.to('user-' + user.id).emit('channels-user-in', channels_in);
      this.server.to('user-' + user.id).emit('channels-user-out', channels_out);
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * leave channel
   * @param LeaveChannelDto : channel id
   */
  @SubscribeMessage('channel-leave')
  async leaveChannel(client: Socket, leaveChannelDto: LeaveChannelDto) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      if (await this.chatService.leaveChannel(user.id, leaveChannelDto)) {
        this.server.emit('channel-need-reload');
      } else {
        /* ? SEND USER LEAVING MSG IN THE CHANNEL ? */
        /* ? NOTIFY THE NEW OWNER ? */

        const [channels_in, channels_out, users] = await Promise.all([
          this.chatService.getUserChannels(user.id),
          this.chatService.getUserNotParticipateChannels(user.id),
          this.chatService.getChannelUsers(leaveChannelDto.channelId),
        ]);
        this.server
          .to('channel-' + leaveChannelDto.channelId)
          .emit('channel-users', users);
        this.server.to('user-' + user.id).emit('channels-user-in', channels_in);
        this.server
          .to('user-' + user.id)
          .emit('channels-user-out', channels_out);
      }
      console.log('User left channel successfully !');
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * change user status
   * @param ChangeStatusDto : channel id
   */
  @SubscribeMessage('channel-status-change')
  async changeChannelUserStatus(
    client: Socket,
    statusChangeDto: ChangeStatusDto,
  ) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.changeChannelUserStatus(user, statusChangeDto);
      const channels_in = this.chatService.getUserChannels(user.id);
      this.server
        .to('user-' + user.id)
        .emit('channels-user-in', await channels_in);
      const users = await this.chatService.getChannelUsers(
        statusChangeDto.channelId,
      );
      this.server
        .to('channel-' + statusChangeDto.channelId)
        .emit('channel-users', users);
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * set administrator
   * @param SetChannelAdminDto (channel id and admin id)
   */
  @SubscribeMessage('channel-admin')
  async setChannelAdmin(client: Socket, setAdminDto: SetChannelAdminDto) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.setChannelAdmin(user.id, setAdminDto);
      console.log('Channel admin has been set/unset successfully !');
      const channels_in = await this.chatService.getUserChannels(user.id);
      this.server
        .to('user-' + setAdminDto.participantId)
        .emit('channels-user-in', channels_in);
      const users = await this.chatService.getChannelUsers(
        setAdminDto.channelId,
      );
      this.server
        .to('channel-' + setAdminDto.channelId)
        .emit('channel-users', users);
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * change Password
   * @param SetChannelPasswordDto : (channel id, action, password)
   */
  @SubscribeMessage('channel-change-password')
  async changeChannelPassword(
    client: Socket,
    channelDto: SetChannelPasswordDto,
  ) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.changeChannelPassword(user.id, channelDto);
      console.log('Channel password has been changed successfully !');
      this.server.emit('channel-need-reload');
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /**
   * Ask to Reload the Channels list
   */
  @SubscribeMessage('ask-reload-channel')
  async reloadChannel(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      const [channels_in, channels_out] = await Promise.all([
        this.chatService.getUserChannels(user.id),
        this.chatService.getUserNotParticipateChannels(user.id),
      ]);
      client.emit('channels-user-in', channels_in);
      client.emit('channels-user-out', channels_out);
    } catch (error) {
      // FIX -> can't use client alert here, check with Felix
      console.log(error);
    }
  }

  /**
   * Load channel data (message) and register to the room event
   * @param data
   */
  @SubscribeMessage('channel-load')
  async loadChannel(client: Socket, channelId: number) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      if (user) {
        const channelParticipant =
          await this.chatService.getOneChannelParticipant(user.id, channelId);
        if (channelParticipant) client.join('channel-' + channelId);
        const messages = await this.messageService.getChannelMessages(
          channelId,
        );
        const users = await this.chatService.getChannelUsers(channelId);
        client.emit('channel-message-list', messages);
        client.emit('channel-users', users);
      }
    } catch (error) {
      console.log(error);
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
  async newChannelMessage(client: Socket, messageDto: CreateMessageDto) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      // Save message in db
      const message = await this.messageService.createChannelMessage(
        user.id,
        messageDto,
      );

      const sendMessage = {
        message_id: message.id,
        message_channelId: message.channelId,
        message_authorId: user.id,
        message_createDate: message.createDate,
        author_nickname: user.nickname,
        author_avatar: user.avatar,
        message_content: message.message,
      };

      // Send message to all people connected in channel
      this.server
        .to('channel-' + message.channelId)
        .emit('channel-new-message', sendMessage);
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  /****************************************************************************/
  /*                               Direct Channel                             */
  /****************************************************************************/

  /**
   * Ask to (Re)load the direct Channels list
   */
  @SubscribeMessage('private-ask-reload')
  async loadPrivate(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      const direct = this.chatService.getDirectChannelList(user.id);
      client.emit('private-list', await direct);
      console.log('direct list', await direct);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Load channel data (message) and register to the room event
   * @param data
   */
  @SubscribeMessage('private-load')
  async loadDirect(client: Socket, loadDirectDto: LoadDirectDto) {
    try {
      let channelId = loadDirectDto.channelId;
      const UserId = loadDirectDto.userId;

      const user1 = await this.authService.getUserFromSocket(client);
      if (user1) {
        if (typeof channelId !== 'undefined') {
          const channelParticipant =
            await this.chatService.getOneChannelParticipant(
              user1.id,
              channelId,
            );
          if (!channelParticipant)
            throw new WsException(
              'you are not in conversation with this user !',
            );
        } else if (typeof UserId !== 'undefined') {
          const user2 = await this.userService.getOneById(UserId);
          const channel = await this.chatService.createDirectChannel(
            user1,
            user2,
          );
          channelId = channel[0].id;
          //   console.log('Channel created successfully !');
        } else throw new WsException('Invalid socket request.');

        client.join('private-' + channelId);
        const messages = await this.messageService.getDirectMessages(channelId);
        const channelInfo = await this.chatService.getDirectInfo(
          user1.id,
          channelId,
        );
        client.emit('private-info', channelInfo);
        client.emit('private-message-list', messages);
        console.log('Channel loaded successfully !');
      }
    } catch (error) {
      console.log(error);
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
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      // Save message in db
      await this.messageService.createChannelMessage(user.id, message);
      // Send message to all people connected in channel
      this.server.to('direct-' + message.channelId).emit('message', message);
    } catch (error) {
      console.log(error);
    }
  }
}

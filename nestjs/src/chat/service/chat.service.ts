import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { Channel, ChannelType } from '../model/channel.entity';
import * as bcrypt from 'bcrypt';
import {
  ChannelParticipant,
  ChannelRole,
  StatusInChannel,
} from '../model/channelParticipant.entity';
import { JoinChannelDto } from '../dto/join-channel.dto';
import { WsException } from '@nestjs/websockets';
import { User } from 'src/user/model/user.entity';
import { LeaveChannelDto } from '../dto/leave-channel.dto';
import { OptionAdmin, SetChannelAdminDto } from '../dto/set-channel-admin.dto';
import {
  OptionPassword,
  SetChannelPasswordDto,
} from '../dto/set-channel-password.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import e from 'cors';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelParticipant)
    private channelParticipantRepository: Repository<ChannelParticipant>,
  ) {}

  /**
   * createChannel creates new channel with a channel owner.
   * (channel-create)
   * @param channelCreatorId id of user who creates channel
   * @param createChannelDto data required for creating channel (name and passward)
   * @returns Promise<Channel>
   */
  async createChannel(
    channelCreatorId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    if (await this.checkChannelName(createChannelDto)) {
      if (createChannelDto.password) {
        this.checkChannelPassword(createChannelDto.password);
      }
      /* Create new channel*/
      const newChannel = this.channelRepository.create({ ...createChannelDto });
      if (newChannel.password) {
        newChannel.type = ChannelType.PRIVATE;
        newChannel.password = await bcrypt.hash(newChannel.password, 10);
      } else newChannel.password = null;
      await this.channelRepository.save(newChannel);

      /* Add channel owner*/
      await this.addChannelParticipant(
        newChannel.id,
        channelCreatorId,
        ChannelRole.OWNER,
      );
      return newChannel;
    }
  }

  /**
   * joinChannel checks and adds a new channel participant.
   * (channel-join)
   * @param JoinChannelDto: channel id and password
   * @returns ChannelParticipant
   */
  async joinChannel(
    userId: number,
    channelDto: JoinChannelDto,
  ): Promise<ChannelParticipant> {
    const [channel, participant] = await Promise.all([
      this.getChannelById(channelDto.channelId),
      this.getOneChannelParticipant(userId, channelDto.channelId),
    ]);
    if (channel.type === ChannelType.DIRECT)
      throw new WsException('You cannot join a private chat channel.');
    if (participant)
      throw new WsException('You are already a member of this channel.');
    if (channel.type === ChannelType.PRIVATE) {
      if (!(await bcrypt.compare(channelDto.password, channel.password))) {
        throw new WsException('Invalid channel password !');
      }
    }
    return this.addChannelParticipant(
      channelDto.channelId,
      userId,
      ChannelRole.USER,
    );
  }

  /**
   * addChannelParticipant adds a new channel participant.
   * @param channel id, user id, user role
   * @returns ChannelParticipant
   */
  addChannelParticipant(
    channelId: number,
    userId: number,
    role: ChannelRole,
  ): Promise<ChannelParticipant> {
    const channelParticipant = this.channelParticipantRepository.create();
    channelParticipant.channelId = channelId;
    channelParticipant.userId = userId;
    channelParticipant.role = role;
    return this.channelParticipantRepository.save(channelParticipant);
  }

  /**
   * leaveChannel checks and removes a channel current participant.
   * (channel-leave)
   * @param LeaveChannelDto: channel id
   * @returns bool, true If channels as been deleted false if is not.
   */
  async leaveChannel(
    userId: number,
    leaveChannelDto: LeaveChannelDto,
  ): Promise<boolean> {
    const [channel, participant, otherUsers] = await Promise.all([
      this.getChannelById(leaveChannelDto.channelId),
      this.getOneChannelParticipant(userId, leaveChannelDto.channelId),
      this.channelParticipantRepository.find({
        where: {
          channelId: leaveChannelDto.channelId,
          userId: Not(userId),
          status: StatusInChannel.NORMAL,
        },
      }),
    ]);
    if (this.isChannelParticipant(participant, channel)) {
      if (
        participant.status === StatusInChannel.BAN ||
        participant.status === StatusInChannel.MUTE
      )
        throw new WsException(
          'You could not leave a channel from which you were banned or mute.',
        );
    }
    if (otherUsers.length === 0) {
      console.log(`Channel ${channel.name} has been deleted.`);
      await this.channelRepository.remove(channel);
      return true;
    }
    if (participant.role === ChannelRole.OWNER) {
      const admin = otherUsers.filter(
        (data) => data.role === ChannelRole.ADMIN,
      );
      if (admin.length !== 0) {
        admin[0].role = ChannelRole.OWNER;
        await this.channelParticipantRepository.save(admin[0]);
      } else {
        otherUsers[0].role = ChannelRole.OWNER;
        await this.channelParticipantRepository.save(otherUsers[0]);
      }
    }
    await this.channelParticipantRepository.remove(participant);
    return false;
  }

  async changeChannelUserStatus(
    user: User,
    statusChange: ChangeStatusDto,
  ): Promise<ChannelParticipant> {
    const channelOperator = await this.getOneChannelParticipant(
      user.id,
      statusChange.channelId,
    );

    const channelUser = await this.getOneChannelParticipant(
      statusChange.userId,
      statusChange.channelId,
    );

    if (
      channelOperator.role != ChannelRole.OWNER &&
      channelOperator.role != ChannelRole.ADMIN
    )
      throw new WsException(
        'You must be an administrator or owner to change the status of a user.',
      );

    if (
      (channelOperator.role == ChannelRole.ADMIN &&
        channelUser.role == ChannelRole.ADMIN) ||
      channelUser.role == ChannelRole.OWNER
    )
      throw new WsException(
        'you must have a higher role to change the status of a user.',
      );

    if (
      statusChange.status != StatusInChannel.BAN &&
      statusChange.status != StatusInChannel.MUTE &&
      statusChange.status != StatusInChannel.NORMAL
    )
      throw new WsException('The status does not exist.');

    channelUser.status = statusChange.status;
    if (statusChange.sanctionDuration == 0) channelUser.statusExpiration = null;
    else
      channelUser.statusExpiration = new Date(
        Date.now() + statusChange.sanctionDuration * 60 * 1000,
      );

    return this.channelParticipantRepository.save(channelUser);
  }

  /**
   * setChannelAdmin
   * (channel-set-admin)
   * @param : SetChannelAdminDto (channel id, admin id, action)
   */
  async setChannelAdmin(
    userId: number,
    setAdminDto: SetChannelAdminDto,
  ): Promise<ChannelParticipant> {
    if (
      setAdminDto.action === OptionAdmin.SET ||
      setAdminDto.action === OptionAdmin.UNSET
    ) {
      const [channel, operator, participant] = await Promise.all([
        this.getChannelById(setAdminDto.channelId),
        this.getOneChannelParticipant(userId, setAdminDto.channelId),
        this.getOneChannelParticipant(
          setAdminDto.participantId,
          setAdminDto.channelId,
        ),
      ]);
      if (channel.type === ChannelType.DIRECT)
        throw new WsException(`${channel.name} is a direct channel.`);
      if (
        this.isChannelParticipant(operator, channel) &&
        this.isChannelParticipant(participant, channel) &&
        this.isChannelOwner(operator, channel)
      ) {
        if (setAdminDto.action === OptionAdmin.SET) {
          if (this.isChannelParticipantNormalUser(participant, channel)) {
            participant.role = ChannelRole.ADMIN;
            return this.channelParticipantRepository.save(participant);
          }
        } else {
          if (this.isChannelAdmin(participant, channel)) {
            participant.role = ChannelRole.USER;
            return this.channelParticipantRepository.save(participant);
          }
        }
      }
    } else throw new WsException('Wrong admin setting action.');
  }

  /**
   * changeChannelPassword
   * (channel-change-password)
   * @param : SetChannelPasswordDto (channel id, action, password)
   */
  async changeChannelPassword(
    userId: number,
    channelDto: SetChannelPasswordDto,
  ): Promise<Channel> {
    const [channel, user] = await Promise.all([
      this.getChannelById(channelDto.channelId),
      this.getOneChannelParticipant(userId, channelDto.channelId),
    ]);
    if (
      this.isChannelParticipant(user, channel) &&
      this.isChannelOwner(user, channel)
    ) {
      if (
        (channelDto.action === OptionPassword.ADD &&
          this.checkChannelType(channel, ChannelType.PUBLIC)) ||
        (channelDto.action === OptionPassword.CHANGE &&
          this.checkChannelType(channel, ChannelType.PRIVATE))
      ) {
        if (this.checkChannelPassword(channelDto.password)) {
          channel.password = await bcrypt.hash(channelDto.password, 10);
          channel.type = ChannelType.PRIVATE;
          return this.channelRepository.save(channel);
        }
      } else if (
        channelDto.action === OptionPassword.REMOVE &&
        channelDto.password === null &&
        this.checkChannelType(channel, ChannelType.PRIVATE)
      ) {
        channel.type = ChannelType.PUBLIC;
        channel.password = null;
        return this.channelRepository.save(channel);
      } else {
        throw new WsException('Wrong password setting action.');
      }
    }
  }

  /****************************************************************************/
  /*                          Channel Getters                                 */
  /****************************************************************************/

  /**
   * getAllChannels returns the list of channels that have been created.
   * @returns Promise<Channel[]> returns channel list.
   */
  getAllChannels(): Promise<Channel[]> {
    return this.channelRepository.find({ order: { createDate: 'ASC' } });
  }

  /**
   * getChannelById Return channel data
   * @param channelId
   */
  async getChannelById(channelId: number): Promise<Channel> {
    const channel = await this.channelRepository.findOne(channelId);
    if (!channel) throw new WsException('The channel does not exist.');
    return channel;
  }

  /**
   * getChannelUsers get the channel's users
   * @param channelId channel id
   * @returns Promise<any> return
   */
  async getChannelUsers(channelId: number): Promise<any> {
    await this.getChannelById(channelId);
    return this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.user', 'user')
      .select(['role', 'status', 'user.id', 'user.nickname', 'user.avatar'])
      .where('channelParticipant.channelId = :Id', { Id: channelId })
      .execute();
  }

  async getChannelUsersAmount(channelId: number): Promise<number[]> {
    const channelUsers = await this.channelRepository.find({
      where: { id: channelId },
      relations: ['participant'],
    });
    const amount = channelUsers.map((data) => data.participant.length);
    return amount;
  }

  /****************************************************************************/
  /*                             User Getters                                 */
  /****************************************************************************/

  /**
   * getUserChannels returns all the channels in which user participates.
   * @param userId the id of user
   * @returns Promise<ChannelParticipant> [{ channel_id, channel_name, channel_type, role, status}]
   */
  getUserChannels(userId: number): Promise<any> {
    return this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.channel', 'channel')
      .select(['role', 'status', 'channel.id', 'channel.type', 'channel.name'])
      .where('channelParticipant.userId = :Id', { Id: userId })
      .andWhere('status != :status', { status: StatusInChannel.BAN })
      .execute();
  }

  /**
   * getUserNotParticipateChannels returns the list of channels user dosen't participates.
   * @param userId the id of user
   * @returns Promise<ChannelParticipant> [{ channel_id, channel_name, channel_type, role, status}]
   */
  async getUserNotParticipateChannels(
    userId: number,
  ): Promise<ChannelParticipant> {
    /* Get channels' ids in which the user participate*/
    const [userChannels, allUserChannels] = await Promise.all([
      this.channelParticipantRepository.find({
        where: { userId: userId },
      }),
      this.channelParticipantRepository
        .createQueryBuilder('channelParticipant')
        .leftJoinAndSelect('channelParticipant.channel', 'channel')
        .select([
          'role',
          'status',
          'channel.id',
          'channel.type',
          'channel.name',
        ])
        .execute(),
    ]);
    const channelIds = userChannels.map((data) => data.channelId);
    const seen = [];
    const userNotJoinChannels = allUserChannels
      .filter((data) => (channelIds.includes(data.channel_id) ? false : true))
      .filter((data) => {
        if (seen.includes(data.channel_id)) return false;
        else {
          seen.push(data.channel_id);
          return true;
        }
      });
    return userNotJoinChannels;
  }

  /**
   * getOneChannelParticipant returns the participant in the matched channel,
   * if this user is not in the channel, return null
   * @param userId
   * @param channelId
   * @returns
   */
  getOneChannelParticipant(
    userId: number,
    channelId: number,
  ): Promise<ChannelParticipant> {
    return this.channelParticipantRepository.findOne({
      where: {
        userId: userId,
        channelId: channelId,
      },
    });
  }

  /****************************************************************************/
  /*                               Direct Channel                             */
  /****************************************************************************/

  async createDirectChannel(user1: User, user2: User): Promise<Channel> {
    // Check if the channel already exists.
    const channel = await this.channelParticipantRepository
      .createQueryBuilder()
      .leftJoinAndSelect('ChannelParticipant.channel', 'channel')
      .select(['channel.id'])
      .where('channel.type = :Type', { Type: ChannelType.DIRECT })
      .andWhere('participant.userId = :Id', { Id: user1.id })
      .andWhere('participant.userId = :Id', { Id: user2.id })
      .execute();
    // if not true ???
    if (!channel) throw new WsException('The convesation already exists');

    const newChannel = this.channelRepository.create();
    newChannel.name = `${user1.nickname} , ${user2.nickname}`;
    newChannel.type = ChannelType.DIRECT;
    await this.channelRepository.save(newChannel);

    await Promise.all([
      this.addChannelParticipant(newChannel.id, user1.id, ChannelRole.OWNER),
      this.addChannelParticipant(newChannel.id, user2.id, ChannelRole.OWNER),
    ]);
    return newChannel;
  }

  async getDirectChannelList(userId: number): Promise<Channel[]> {
    return this.channelRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channelParticipant', 'participant')
      .select(['channel.id', 'channel.name'])
      .where('channel.type = :Type', { Type: ChannelType.DIRECT })
      .andWhere('participant.userId = :Id', { Id: userId })
      .execute();
  }

  /****************************************************************************/
  /*                                 checkers                                 */
  /****************************************************************************/

  async checkChannelName(createChannelDto: CreateChannelDto): Promise<boolean> {
    const channelNames = (await this.getAllChannels()).map((data) => data.name);
    if (channelNames.includes(createChannelDto.name)) {
      throw new WsException('Channel name has been taken, choose a new one.');
    }
    return true;
  }

  checkChannelPassword(password: string): boolean {
    if (password.length < 4 || password.length > 16) {
      throw new WsException(
        'Channel password should consist 4 to 16 letters including alphabets numbers and specials.',
      );
    }
    return true;
  }

  checkChannelType(channel: Channel, type: ChannelType): boolean {
    if (channel.type !== type) {
      throw new WsException(
        `The channel [${channel.name}] type is not correct.`,
      );
    }
    return true;
  }

  isChannelParticipant(
    participant: ChannelParticipant,
    channel: Channel,
  ): boolean {
    if (!participant) {
      throw new WsException(
        `User is not a member of channel [${channel.name}].`,
      );
    }
    return true;
  }

  isChannelOwner(participant: ChannelParticipant, channel: Channel): boolean {
    if (participant.role !== ChannelRole.OWNER) {
      throw new WsException(
        `${participant.user.nickname} is not the owner of channel [${channel.name}].
        Only the owner can add/change/delete password and set/unset administrators.`,
      );
    }
    return true;
  }

  isChannelAdmin(participant: ChannelParticipant, channel: Channel): boolean {
    if (participant.role !== ChannelRole.ADMIN) {
      throw new WsException(
        `${participant.user.nickname} is not the administrator of channel [${channel.name}].`,
      );
    }
    return true;
  }

  isChannelParticipantNormalUser(
    participant: ChannelParticipant,
    channel: Channel,
  ): boolean {
    if (participant.role !== ChannelRole.USER) {
      throw new WsException(
        `${participant.user.nickname} is already the owner/administrator of channel [${channel.name}].`,
      );
    }
    if (participant.status !== StatusInChannel.NORMAL) {
      throw new WsException(
        `${participant.user.nickname} is muted/banned in channel [${channel.name}].`,
      );
    }
    return true;
  }
}

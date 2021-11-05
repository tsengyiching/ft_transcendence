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
import { GeneralChannelDto } from '../dto/general-channel.dto';
import { WsException } from '@nestjs/websockets';
import { User } from 'src/user/model/user.entity';
import { LeaveChannelDto } from '../dto/leave-channel.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';

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
      }
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
   * @param GeneralChannelDto: channel id and password
   * @returns ChannelParticipant
   */
  async joinChannel(
    userId: number,
    channelDto: GeneralChannelDto,
  ): Promise<ChannelParticipant> {
    const res = await Promise.all([
      this.getChannelById(channelDto.channelId),
      this.getOneChannelParticipant(userId, channelDto.channelId),
    ]);
    if (res[0].type === ChannelType.DIRECT)
      throw new WsException('You cannot join a private chat channel.');
    if (res[1])
      throw new WsException('You are already a member of this channel.');
    if (res[0].type === ChannelType.PRIVATE) {
      if (!(await bcrypt.compare(channelDto.password, res[0].password))) {
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
    const res = await Promise.all([
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
    if (this.isChannelParticipant(res[1])) {
      if (res[1].status === StatusInChannel.BAN)
        throw new WsException('User is banned in this channel.');
    }
    if (res[2].length === 0) {
      console.log(`Channel ${res[0].name} has been deleted.`);
      await this.channelRepository.remove(res[0]);
      return true;
    }
    // if (participant.role === ChannelRole.OWNER) {
    //   const admin = channelUsers.filter(
    //     (data) => data.role === ChannelRole.ADMIN,
    //   );

    // }
    //{ -> admin becomes owner/ no admin -> random}
    await this.channelParticipantRepository.remove(res[1]);
    return false;
  }

  async changeChannelUserStatus(user: User, statusChange: ChangeStatusDto) {
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
    channelUser.statusExpiration = Date.now() + statusChange.statusExpiration;

    this.channelParticipantRepository.save(channelUser);
  }

  /**
   * addChannelPassword
   * (channel-add-password)
   * @param : GeneralChannelDto (channel id and password)
   */
  async addChannelPassword(
    userId: number,
    channelDto: GeneralChannelDto,
  ): Promise<Channel> {
    const res = await Promise.all([
      this.getChannelById(channelDto.channelId),
      this.getOneChannelParticipant(userId, channelDto.channelId),
    ]);
    if (
      this.checkChannelType(res[0], ChannelType.PUBLIC) &&
      this.isChannelParticipant(res[1]) &&
      this.isChannelParticipantOwner(res[1]) &&
      this.checkChannelPassword(channelDto.password)
    ) {
      res[0].password = await bcrypt.hash(channelDto.password, 10);
      res[0].type = ChannelType.PRIVATE;
      return this.channelRepository.save(res[0]);
    }
  }

  /**
   * changeChannelPassword
   * (channel-change-password)
   * @param : GeneralChannelDto (channel id and password)
   */
  async changeChannelPassword(
    userId: number,
    channelDto: GeneralChannelDto,
  ): Promise<Channel> {
    const res = await Promise.all([
      this.getChannelById(channelDto.channelId),
      this.getOneChannelParticipant(userId, channelDto.channelId),
    ]);
    if (
      this.checkChannelType(res[0], ChannelType.PRIVATE) &&
      this.isChannelParticipant(res[1]) &&
      this.isChannelParticipantOwner(res[1]) &&
      this.checkChannelPassword(channelDto.password)
    ) {
      res[0].password = await bcrypt.hash(channelDto.password, 10);
      return this.channelRepository.save(res[0]);
    }
  }

  /**
   * deleteChannelPassword
   * (channel-delete-password)
   * @param : channel id
   */
  async deleteChannelPassword(
    userId: number,
    channelId: number,
  ): Promise<Channel> {
    const res = await Promise.all([
      this.getChannelById(channelId),
      this.getOneChannelParticipant(userId, channelId),
    ]);
    if (
      this.checkChannelType(res[0], ChannelType.PRIVATE) &&
      this.isChannelParticipant(res[1]) &&
      this.isChannelParticipantOwner(res[1])
    ) {
      res[0].type = ChannelType.PUBLIC;
      res[0].password = null;
      return this.channelRepository.save(res[0]);
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
   * @returns Promise<ChannelParticipant> return
   */
  getChannelUsers(channelId: number): Promise<ChannelParticipant> {
    return this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.user', 'user')
      .select(['role', 'user.id', 'user.nickname', 'user.avatar'])
      .where('channelParticipant.channelId = :Id', { Id: channelId })
      .andWhere('status != :status', { status: StatusInChannel.BAN })
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
  getUserChannels(userId: number): Promise<ChannelParticipant> {
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
    const res = await Promise.all([
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
    const channelIds = res[0].map((data) => data.channelId);
    const seen = [];
    const userNotJoinChannels = res[1]
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
    let channel = await this.channelParticipantRepository
      .createQueryBuilder()
      .leftJoinAndSelect('ChannelParticipant.channel', 'channel')
      .select(['channel.id'])
      .where('channel.type = :Type', { Type: ChannelType.DIRECT })
      .andWhere('participant.userId = :Id', { Id: user1.id })
      .andWhere('participant.userId = :Id', { Id: user2.id })
      .execute();

    if (!channel) throw new WsException('The convesation already exists');

    const newChannel = this.channelRepository.create();
    newChannel.name = user1.nickname + ', ' + user2.nickname;
    newChannel.type = ChannelType.DIRECT;
    channel = this.channelRepository.save(newChannel);

    this.createDirectChannelParticipant(await channel, user1);
    this.createDirectChannelParticipant(await channel, user2);
    return channel;
  }

  async createDirectChannelParticipant(channel: Channel, user: User) {
    const newUserparticipant = this.channelParticipantRepository.create();
    newUserparticipant.channelId = channel.id;
    newUserparticipant.role = ChannelRole.OWNER;
    newUserparticipant.userId = user.id;
    this.channelParticipantRepository.save(newUserparticipant);
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
      throw new WsException('The channel type is not correct.');
    }
    return true;
  }

  isChannelParticipant(participant: ChannelParticipant): boolean {
    if (!participant) {
      throw new WsException('You are not a member of this channel.');
    }
    return true;
  }

  isChannelParticipantOwner(participant: ChannelParticipant): boolean {
    if (participant.role !== ChannelRole.OWNER) {
      throw new WsException(
        'Only channel owner have the right to add/change/delete password.',
      );
    }
    return true;
  }
}

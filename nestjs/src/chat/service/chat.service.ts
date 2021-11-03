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
    await this.checkChannelNameAndPassword(createChannelDto);
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
    const channel = await this.getChannelById(channelDto.channelId);
    const participant = await this.getOneChannelParticipant(
      userId,
      channelDto.channelId,
    );
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
  async addChannelParticipant(
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
   * @returns deleted ChannelParticipant
   */
  async leaveChannel(userId: number, leaveChannelDto: LeaveChannelDto) {
    /* check channel */
    const channel = await this.getChannelById(leaveChannelDto.channelId);
    /* check participant */
    const participant = await this.getOneChannelParticipant(
      userId,
      leaveChannelDto.channelId,
    );
    await this.isChanelParticipant(participant);
    if (participant.status === StatusInChannel.BAN)
      throw new WsException('User is banned in this channel.');
    /* check channel other participants */
    const channelUsers = await this.channelParticipantRepository.find({
      where: {
        channelId: leaveChannelDto.channelId,
        userId: Not(userId),
        status: StatusInChannel.NORMAL,
      },
    });
    console.log(channelUsers);
    if (channelUsers.length === 0) {
      console.log(`Channel ${channel.name} has been deleted.`);
      await this.channelRepository.remove(channel);
    }
    // if (participant.role === ChannelRole.OWNER) {
    //   const admin = channelUsers.filter(
    //     (data) => data.role === ChannelRole.ADMIN,
    //   );

    // }
    //{ -> admin becomes owner/ no admin -> random}
    return this.channelParticipantRepository.remove(participant);
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
    const channel = await this.getChannelById(channelDto.channelId);
    const participant = await this.getOneChannelParticipant(
      userId,
      channelDto.channelId,
    );
    await this.checkChannelType(channel, ChannelType.PUBLIC);
    await this.isChanelParticipant(participant);
    await this.isChannelParticipantOwner(participant);
    await this.checkChannelPassword(channelDto.password);
    channel.password = await bcrypt.hash(channelDto.password, 10);
    channel.type = ChannelType.PRIVATE;
    return this.channelRepository.save(channel);
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
    const channel = await this.getChannelById(channelDto.channelId);
    const participant = await this.getOneChannelParticipant(
      userId,
      channelDto.channelId,
    );
    await this.checkChannelType(channel, ChannelType.PRIVATE);
    await this.isChanelParticipant(participant);
    await this.isChannelParticipantOwner(participant);
    await this.checkChannelPassword(channelDto.password);
    channel.password = await bcrypt.hash(channelDto.password, 10);
    return this.channelRepository.save(channel);
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
    const channel = await this.getChannelById(channelId);
    const participant = await this.getOneChannelParticipant(userId, channelId);
    await this.checkChannelType(channel, ChannelType.PRIVATE);
    await this.isChanelParticipant(participant);
    await this.isChannelParticipantOwner(participant);
    channel.type = ChannelType.PUBLIC;
    channel.password = null;
    return this.channelRepository.save(channel);
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
    /* if user status is ban, HAVE TO CHECK WHAT WE WANT TO DO LATER*/
    const userChannels = await this.channelParticipantRepository.find({
      where: { userId: userId },
    });
    const channelIds = userChannels.map((data) => data.channelId);

    const allUserChannels = await this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.channel', 'channel')
      .select(['role', 'status', 'channel.id', 'channel.type', 'channel.name'])
      .execute();
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

  async checkChannelNameAndPassword(
    createChannelDto: CreateChannelDto,
  ): Promise<void> {
    const channelNames = await (
      await this.getAllChannels()
    ).map((data) => data.name);
    if (channelNames.includes(createChannelDto.name)) {
      console.log('Channel name has been taken.');
      throw new WsException('Channel name has been taken, choose a new one.');
    }
    if (createChannelDto.password) {
      await this.checkChannelPassword(createChannelDto.password);
    }
  }

  async checkChannelPassword(password: string): Promise<void> {
    if (!password) {
      console.log('Empty password');
      throw new WsException('Channel password is empty.');
    }
    if (password.length < 4 || password.length > 16) {
      console.log('Wrong password');
      throw new WsException(
        'Channel password should consist 4 to 16 letters including alphabets numbers and specials.',
      );
    }
  }

  async checkChannelType(channel: Channel, type: ChannelType): Promise<void> {
    if (channel.type !== type) {
      console.log('The channel type is not correct.');
      throw new WsException('The channel type is not correct.');
    }
  }

  async isChanelParticipant(participant: ChannelParticipant): Promise<void> {
    if (!participant) {
      console.log('You are not a member of this channel.');
      throw new WsException('You are not a member of this channel.');
    }
  }

  async isChannelParticipantOwner(
    participant: ChannelParticipant,
  ): Promise<void> {
    if (participant.role !== ChannelRole.OWNER) {
      console.log(
        'Only channel owner have the right to add/change/delete password.',
      );
      throw new WsException(
        'Only channel owner have the right to add/change/delete password.',
      );
    }
  }
}

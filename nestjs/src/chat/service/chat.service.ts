import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/channel.dto';
import { Channel, ChannelType } from '../model/channel.entity';
import * as bcrypt from 'bcrypt';
import {
  ChannelParticipant,
  ChannelRole,
  StatusInChannel,
} from '../model/channelParticipant.entity';
import { CreateChannelParticipantDto } from '../dto/create-channel-participant.dto';
import { WsException } from '@nestjs/websockets';
import { EEXIST } from 'constants';
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
   * (Channel Create)
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
   * (Channel Join)
   * @param createChannelParticipantDto
   * @returns ChannelParticipant
   */
  async joinChannel(
    userId: number,
    createChannelParticipantDto: CreateChannelParticipantDto,
  ): Promise<ChannelParticipant> {
    const channel = await this.getChannelById(
      createChannelParticipantDto.channelId,
    );
    if (!channel)
      throw new WsException(
        'The channel that you wish to join does not exist.',
      );
    const participant = await this.getOneChannelParticipant(
      userId,
      createChannelParticipantDto.channelId,
    );
    if (participant)
      throw new WsException('You are already a member of this channel.');
    if (channel.type == ChannelType.PRIVATE) {
      if (
        !(await bcrypt.compare(
          createChannelParticipantDto.password,
          channel.password,
        ))
      ) {
        console.log('Invalid channel password !');
        throw new WsException('Invalid channel password !');
      }
    }
    return this.addChannelParticipant(
      createChannelParticipantDto.channelId,
      userId,
      ChannelRole.USER,
    );
  }

  /**
   * getUserNotParticipateChannels returns the list of channels user dosen't participates.
   * @param userId the id of user
   * @returns Promise<any> [{ channel_id, channel_name, channel_type, role, status}]
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

  /**
   * getAllChannel returns the list of channels that have been created.
   * @returns Promise<Channel[]> returns channel list.
   */
  getAllChannel(): Promise<Channel[]> {
    return this.channelRepository.find({ order: { createDate: 'ASC' } });
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

  /**
   * getChannelById Return channel data
   * @param channelId
   */
  getChannelById(channelId: number): Promise<Channel> {
    return this.channelRepository.findOne(channelId);
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

  /****************************************************************************/
  /*                                 checkers                                 */
  /****************************************************************************/

  async checkChannelNameAndPassword(
    createChannelDto: CreateChannelDto,
  ): Promise<void> {
    const channelNames = await (
      await this.getAllChannel()
    ).map((data) => data.name);
    if (channelNames.includes(createChannelDto.name)) {
      console.log('Channel name has been taken.');
      throw new WsException('Channel name has been taken, choose a new one.');
    }
    if (createChannelDto.password) {
      if (
        createChannelDto.password.length < 4 ||
        createChannelDto.password.length > 16
      ) {
        console.log('Wrong password');
        throw new WsException(
          'Channel password should consist 4 to 16 letters including alphabets numbers and specials ',
        );
      }
    }
  }
}

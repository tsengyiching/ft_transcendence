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
      )
        throw new WsException('Invalid channel password !');
    }
    return this.addChannelParticipant(
      createChannelParticipantDto.channelId,
      userId,
      ChannelRole.USER,
    );
  }

  /**
   * getAllChannel return all channel list.
   * @returns Promise<Channel[]> return all channel list.
   */
  getAllChannel(): Promise<Channel[]> {
    return this.channelRepository.find({ order: { createDate: 'ASC' } });
  }

  /**
   * getChannelUserParticipate returns the list of channels user dosen't participates.
   * @param userId the id of user
   * @returns Promise<any> [{ channel_id, channel_name, channel_type, role, status}]
   */
  async getChannelUserNotParticipate(userId: number): Promise<any> {
    const registredChannel = await this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.channel', 'channel')
      .select(['channel.id'])
      .where('channelParticipant.userId = :Id', { Id: userId })
      //   .andWhere('status != :status', { status: StatusInChannel.BAN })
      .execute();

    const channelList = await this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.channel', 'channel')
      .select(['role', 'status', 'channel.id', 'channel.type', 'channel.name'])
      .execute();

    let channelListLenght = channelList.length;
    for (let i = 0; i < channelListLenght; i++) {
      for (let j = 0; j < registredChannel.length; j++) {
        if (channelList[i].channel_id == registredChannel[j].channel_id) {
          channelList.splice(i, 1);
          channelListLenght = channelList.length;
          i = -1;
          j = 0;
          break;
        }
      }
    }

    return channelList;
  }

  /**
   * getChannelUserParticipate returns the list of channels in which a user participates.
   * @param userId the id of user
   * @returns Promise<any> [{ channel_id, channel_name, channel_type, role, status}]
   */
  getChannelUserParticipate(userId: number): Promise<any> {
    return this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.channel', 'channel')
      .select(['role', 'status', 'channel.id', 'channel.type', 'channel.name'])
      .where('channelParticipant.userId = :Id', { Id: userId })
      .andWhere('status != :status', { status: StatusInChannel.BAN })
      .execute();
  }

  /**
   * getUserParticipateChannel get user participating to a specifique channel
   * @param channelId channel id
   * @returns Promise<any> return
   */
  getUserParticipateChannel(channelId: number): Promise<any> {
    return this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.user', 'user')
      .select(['role', 'user.id', 'user.nickname', 'user.avatar'])
      .where('channelParticipant.channelId = :Id', { Id: channelId })
      .andWhere('status != :status', { status: StatusInChannel.BAN })
      .execute();
  }

  /**
   * getOneChannelParticipant return data of channel participant
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

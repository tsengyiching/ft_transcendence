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
   * createChannel creating new channel with channel owner.
   * (Channel Create)
   * @param channelCreatorId id of user creating channel
   * @param createChannelDto data requirer to create channel (name)
   * @returns Promise<Channel>
   */
  async createChannel(
    channelCreatorId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    // Creating Channel
    const newChannel = this.channelRepository.create({ ...createChannelDto });
    if (newChannel.password && newChannel.password.length != 0) {
      newChannel.type = ChannelType.PRIVATE;
      newChannel.password = await bcrypt.hash(newChannel.password, 10);
    }
    await this.channelRepository.save(newChannel);
    //  Creating Channel Owner
    const channelOwner = this.channelParticipantRepository.create();
    channelOwner.channelId = newChannel.id;
    channelOwner.userId = channelCreatorId;
    channelOwner.role = ChannelRole.OWNER;
    await this.channelParticipantRepository.save(channelOwner);
    return newChannel;
  }

  /**
   * addChannelParticipant add a channel participant.
   * (Channel Join)
   * @param createChannelParticipantDto
   * @returns ChannelParticipant
   */
  async addChannelParticipant(
    userId: number,
    createChannelParticipantDto: CreateChannelParticipantDto,
  ): Promise<ChannelParticipant> {
    const newChannelParticipant = this.channelParticipantRepository.create({
      ...createChannelParticipantDto,
    });
    const channel = await this.getChannelById(
      createChannelParticipantDto.channelId,
    );
    if (!channel)
      throw new WsException('The channel you wish to join does not exist.');
    const participant = await this.getOneChannelParticipant(
      userId,
      createChannelParticipantDto.channelId,
    );
    if (participant)
      throw new WsException('You already participate in this channel.');
    if (channel.type == ChannelType.PRIVATE)
      if (
        !(await bcrypt.compare(
          createChannelParticipantDto.password,
          channel.password,
        ))
      )
        throw new WsException('Invalid channel password !');
    newChannelParticipant.userId = userId;
    newChannelParticipant.role = ChannelRole.USER;
    newChannelParticipant.status = StatusInChannel.NORMAL;
    return this.channelParticipantRepository.save(newChannelParticipant);
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
  getChannelUserNotParticipate(userId: number): Promise<any> {
    return this.channelParticipantRepository
      .createQueryBuilder('channelParticipant')
      .leftJoinAndSelect('channelParticipant.channel', 'channel')
      .select(['channel.id', 'channel.type', 'channel.name'])
      .where('channelParticipant.userId != :Id', { Id: userId })
      .execute();
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
   * @returns
   */
  getChannelById(channelId: number): Promise<Channel> {
    return this.channelRepository.findOne(channelId);
  }
}

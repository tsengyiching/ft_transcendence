import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/channel.dto';
import { Channel, ChannelType } from '../model/channel.entity';
import * as bcrypt from 'bcrypt';
import {
  ChannelParticipant,
  ChannelRole,
} from '../model/channelParticipant.entity';
import { CreateChannelParticipantDto } from '../dto/create-channel-participant.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelParticipant)
    private channelParticipantRepository: Repository<ChannelParticipant>,
  ) {}

  async createChannelWithDto(
    channelCreatorId: number,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const newChannel = this.channelRepository.create({ ...createChannelDto });
    if (newChannel.password && newChannel.password.length != 0) {
      newChannel.type = ChannelType.PRIVATE;
      newChannel.password = await bcrypt.hash(newChannel.password, 10);
    }
    await this.channelRepository.save(newChannel);
    const channelOwner = this.channelParticipantRepository.create();
    channelOwner.channelId = newChannel.id;
    channelOwner.userId = channelCreatorId;
    channelOwner.role = ChannelRole.OWNER;
    await this.channelParticipantRepository.save(channelOwner);
    return newChannel;
  }

  /**
   *
   * @param createChannelParDto
   * @returns
   */
  async addChannelParticipant(
    createChannelParticipantDto: CreateChannelParticipantDto,
  ): Promise<ChannelParticipant> {
    const newChannelParticipant = this.channelParticipantRepository.create({
      ...createChannelParticipantDto,
    });
    console.log(newChannelParticipant);
    return this.channelRepository.save(newChannelParticipant);
  }

  getAllChannel(): Promise<Channel[]> {
    return this.channelRepository.find({ order: { createDate: 'ASC' } });
  }
}

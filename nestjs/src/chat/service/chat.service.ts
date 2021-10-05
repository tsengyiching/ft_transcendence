import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/channel.dto';
import { Channel, ChannelType } from '../model/channel.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
  ) {}

  async createChannelWithDto(
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const newChannel = this.channelRepository.create({ ...createChannelDto });
    if (!newChannel.password && newChannel.password.length != 0) {
      newChannel.type = ChannelType.PRIVATE;
      newChannel.password = await bcrypt.hash(newChannel.password, 10);
    }

    return this.channelRepository.save(newChannel);
  }

  getAllChannel(): Promise<Channel[]> {
    return this.channelRepository.find({ order: { createDate: 'ASC' } });
  }
}

/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../model/channel.dto';
import { Channel } from '../model/channel.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
  ) {}

  createChannelWithDto(createChannelDto: CreateChannelDto): Promise<Channel> {
    const newChannel = this.channelRepository.create({ ...createChannelDto });
    return this.channelRepository.save(newChannel);
  }

  getAllChannel(): Promise<Channel[]> {
    return this.channelRepository.find({ order: { createDate: 'ASC' } });
  }
}

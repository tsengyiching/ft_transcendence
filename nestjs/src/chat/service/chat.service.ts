/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChanelDto } from '../model/chanel.dto';
import { Chanel } from '../model/chanel.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chanel) private chanelRepository: Repository<Chanel>,
  ) {}

  createChanelWithDto(createChanelDto: CreateChanelDto): Promise<Chanel> {
    const newChanel = this.chanelRepository.create({ ...createChanelDto });
    return this.chanelRepository.save(newChanel);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'diagnostics_channel';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Message } from '../model/messages.entity';
import { ChatService } from './chat.service';

@Injectable()
export class MessageService {
  constructor(
    private channelService: ChatService,
    @InjectRepository(Channel) private channelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getChannelMessages(authorId: number, channelId: number) {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .select([
        'message.id',
        'message.channelId',
        'message.authorId',
        'author.nickname',
        'message.createDate',
      ])
      .addSelect('message.message', 'message_content')
      .where('message.channelId = :Id', { Id: channelId })
      .execute();
  }

  async createChannelMessage(
    authorId: number,
    createMessageDto: CreateMessageDto,
  ) {
    // Check if channel exit
    // await this.channelService.getChannelById(createMessageDto.channelID);
    await this.channelService.getOneChannelParticipant(
      authorId,
      createMessageDto.channelId,
    ); // check if user participate to the channel
    const newMessage = this.messageRepository.create({ ...createMessageDto });
    newMessage.authorId = authorId;
    return this.messageRepository.save(newMessage);
  }
}

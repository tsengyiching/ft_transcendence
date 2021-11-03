import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Message } from '../model/messages.entity';
import { ChatService } from './chat.service';

@Injectable()
export class MessageService {
  constructor(
    private channelService: ChatService,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createChannelMessage(
    authorId: number,
    createMessageDto: CreateMessageDto,
  ) {
    // Check if channel exit
    await this.channelService.getOneChannelParticipant(
      authorId,
      createMessageDto.channelId,
    ); // check if user participate to the channel
    const newMessage = this.messageRepository.create({ ...createMessageDto });
    newMessage.authorId = authorId;
    return this.messageRepository.save(newMessage);
  }

  async getChannelMessages(channelId: number) {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .select([
        'message.id',
        'message.channelId',
        'message.authorId',
        'author.nickname',
        'author.avatar',
        'message.createDate',
      ])
      .addSelect('message.message', 'message_content')
      .where('message.channelId = :Id', { Id: channelId })
      .execute();
  }

  /****************************************************************************/
  /*                               Direct Channel                             */
  /****************************************************************************/

  async createDirectMessage(
    authorId: number,
    createMessageDto: CreateMessageDto,
  ) {
    // Check if channel exit
    await this.channelService.getOneChannelParticipant(
      authorId,
      createMessageDto.channelId,
    ); // check if user participate to the channel
    const newMessage = this.messageRepository.create({ ...createMessageDto });
    newMessage.authorId = authorId;
    return this.messageRepository.save(newMessage);
  }

  getDirectMessages(channelId: number) {
    return this.messageRepository
      .createQueryBuilder('directMessage')
      .leftJoinAndSelect('message.author', 'author')
      .select([
        'message.id',
        'message.channelId',
        'message.authorId',
        'author.nickname',
        'author.avatar',
        'message.createDate',
      ])
      .addSelect('message.message', 'message_content')
      .where('message.channelId = :Id', { Id: channelId })
      .execute();
  }
}

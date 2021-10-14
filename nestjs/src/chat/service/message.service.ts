import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'diagnostics_channel';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { DirectMessage } from '../model/directMessage.entity';
import { Message } from '../model/messages.entity';
import { ChatService } from './chat.service';

@Injectable()
export class MessageService {
  constructor(
    private channelService: ChatService,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(DirectMessage)
    private directMessageRepository: Repository<DirectMessage>,
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
        'author.avatar',
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
    await this.channelService.getOneChannelParticipant(
      authorId,
      createMessageDto.channelId,
    ); // check if user participate to the channel
    const newMessage = this.messageRepository.create({ ...createMessageDto });
    newMessage.authorId = authorId;
    return this.messageRepository.save(newMessage);
  }

  getDirectMessages(senderId: number, receiverId: number) {
    return this.directMessageRepository.find({
      where: [
        { receiverId: receiverId, senderId: receiverId },
        { receiverId: senderId, senderId: senderId },
      ],
      order: { createDate: 'ASC' },
    });
    //   .createQueryBuilder('directMessage')
    //   .select([
    //     'message.id',
    //     'message.channelId',
    //     'message.authorId',
    //     'author.nickname',
    //     'author.avatar',
    //     'message.createDate',
    //   ])
    //   .addSelect('message.message', 'message_content')
    //   .where('message.channelId = :Id', { Id: channelId })
    //   .execute();
  }

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
}

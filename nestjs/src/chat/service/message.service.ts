import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Channel } from 'diagnostics_channel';
import {
  Relationship,
  RelationshipStatus,
} from 'src/relationship/model/relationship.entity';
import { RelationshipService } from 'src/relationship/service/relationship.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { StatusInChannel } from '../model/channelParticipant.entity';
import { Message } from '../model/messages.entity';
import { ChatService } from './chat.service';

@Injectable()
export class MessageService {
  constructor(
    private channelService: ChatService,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Message>,
    @Inject(forwardRef(() => RelationshipService))
    private relationshipService: RelationshipService,
  ) {}

  async createChannelMessage(
    authorId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    // Check if channel exit
    const participant = await this.channelService.getOneChannelParticipant(
      authorId,
      createMessageDto.channelId,
    ); // check if user participate to the channel

    if (
      participant.status == StatusInChannel.MUTE ||
      participant.status == StatusInChannel.BAN
    ) {
      // if mute expire
      if (participant.statusExpiration == null)
        throw new WsException(
          'Cannot post message in channel if you are ban or mute !',
        );
      if (participant.statusExpiration.getTime() < Date.now()) {
        participant.status = StatusInChannel.NORMAL;
        participant.statusExpiration = null;
        await this.channelRepository.save(participant);
      } else
        throw new WsException(
          'Cannot post message in channel if you are ban or mute !',
        );
    }
    const newMessage = this.messageRepository.create({ ...createMessageDto });
    newMessage.authorId = authorId;
    return this.messageRepository.save(newMessage);
  }

  getChannelMessages(channelId: number) {
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
      .orderBy('message.createDate', 'ASC')
      .execute();
  }

  /****************************************************************************/
  /*                               Direct Channel                             */
  /****************************************************************************/

  async createDirectMessage(
    authorId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
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
      .orderBy('message.createDate', 'ASC')
      .execute();
  }
}

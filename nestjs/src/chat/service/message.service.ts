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
  ) {
    // Check if channel exit
    const participant = await this.channelService.getOneChannelParticipant(
      authorId,
      createMessageDto.channelId,
    ); // check if user participate to the channel

    if (participant.status == StatusInChannel.BAN)
      throw new WsException('Cannot post message in channel if you are ban !');

    if (
      participant.statusExpiration &&
      participant.status == StatusInChannel.MUTE
    ) {
      // if mute expire
      if (participant.statusExpiration < Date.now()) {
        participant.status = StatusInChannel.NORMAL;
        participant.statusExpiration = 0;
        this.channelRepository.save(participant);
      } else
        throw new WsException(
          'cannot post message in channel if you are mute !',
        );
    }
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

  async getDirectMessages(userId: number, channelId: number) {
    const blockedUserId = await this.relationshipService.getBlockingIds(userId);

    const allChannelMessages = await this.messageRepository
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

    const userNotJoinChannels = allChannelMessages.filter(
      (channel) => !blockedUserId.includes(channel.author),
    );
    return userNotJoinChannels;
  }
}

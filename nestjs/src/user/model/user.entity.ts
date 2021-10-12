import { ChannelParticipant } from 'src/chat/model/channelParticipant.entity';
import { Message } from 'src/chat/model/messages.entity';
import { Game } from 'src/game/model/game.entity';
import UserRelationship from 'src/relationship/model/userRelationship.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import UserGameRecords from '../../game/model/userGameRecords.entity';

export enum onlineStatus {
  AVAILABLE = 'Available',
  PALYING = 'Playing',
  OFFLINE = 'Offline',
}

@Entity()
export class User {
  @PrimaryColumn()
  id: number;

  @Column()
  nickname: string;

  @CreateDateColumn()
  createDate: Date;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: onlineStatus,
  })
  userStatus: onlineStatus;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @Column({ nullable: true, select: false })
  twoFactorAuthenticationSecret?: string;

  @OneToMany(() => UserGameRecords, (userGameRecords) => userGameRecords.user)
  userGameRecords!: UserGameRecords[];

  @OneToMany(() => Game, (game) => game.winner)
  victories: Game[];

  @OneToMany(
    () => UserRelationship,
    (userRelationship) => userRelationship.user,
  )
  userRelationship!: UserRelationship[];

  @OneToMany(
    () => ChannelParticipant,
    (channelParticipant) => channelParticipant.user,
  )
  public channelParticipant!: ChannelParticipant[];

  @OneToMany(() => Message, (message) => message.author)
  public message!: Message[];
}

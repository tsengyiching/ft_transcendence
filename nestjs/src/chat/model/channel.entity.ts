import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChannelParticipant } from './channelParticipant.entity';
import { Message } from './messages.entity';

export enum ChannelType {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public name!: string;

  /**
   * Contain Bcrypt hashed password of chanel if is private
   */
  @Column()
  public password?: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.PUBLIC,
  })
  public type!: ChannelType;

  @CreateDateColumn()
  public createDate!: Date;

  @OneToMany(() => ChannelParticipant, (participant) => participant.channel)
  public participant!: ChannelParticipant[];

  @OneToMany(() => Message, (messages) => messages.channel)
  public messages!: Message[];
}

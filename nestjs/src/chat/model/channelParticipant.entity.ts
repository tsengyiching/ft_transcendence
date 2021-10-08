import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/user/model/user.entity';
import { Channel } from './channel.entity';

export enum ChannelRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  USER = 'User',
  BAN = 'Ban',
}

export enum StatusInChannel {
  NORMAL = 'Normal',
  MUTE = 'Mute',
  BLOCK = 'Block',
}

@Entity()
export class ChannelParticipant {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public userId!: number;

  @Column()
  public channelId!: number;

  @ManyToOne(() => User, (user) => user.channelParticipant)
  public user!: User;

  @ManyToOne(() => Channel, (channel) => channel.participant)
  public channel!: Channel;

  @Column({
    type: 'enum',
    enum: ChannelRole,
    default: ChannelRole.USER,
  })
  public role: ChannelRole;

  @Column({
    type: 'enum',
    enum: StatusInChannel,
    default: StatusInChannel.NORMAL,
  })
  public status: StatusInChannel;

  @CreateDateColumn()
  public createDate: Date;
}

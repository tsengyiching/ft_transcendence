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
  OWNER = 0,
  ADMIN = 1,
  USER = 2,
  BAN = 3,
}

export enum StatusInChanel {
  NORMAL = 0,
  MUTE = 1,
  BLOCK = 2,
}

@Entity()
export class ChannelParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  userId: User;

  @ManyToOne(() => Channel)
  channelId: Channel;

  @Column({
    type: 'enum',
    enum: ChannelRole,
    default: ChannelRole.USER,
  })
  role: ChannelRole;

  @Column({
    type: 'enum',
    enum: StatusInChanel,
    default: StatusInChanel.NORMAL,
  })
  status: StatusInChanel;

  @CreateDateColumn()
  createDate: Date;
}

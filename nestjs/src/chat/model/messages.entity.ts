import { User } from 'src/user/model/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelId: number;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  channel: Channel;

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  author: User;

  @Column()
  message: string;

  @CreateDateColumn()
  createDate: Date;
}

import { User } from 'src/user/model/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class Message {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.messages)
  channel: Channel;

  @ManyToOne((user) => User)
  @JoinColumn({ name: 'author' })
  author: User;

  @Column()
  messages: string;

  @CreateDateColumn()
  createDate: Date;
}

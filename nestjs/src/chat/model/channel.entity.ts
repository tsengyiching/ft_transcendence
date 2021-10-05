import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './messages.entity';

export enum ChannelType {
  PUBLIC = 1,
  PRIVATE = 0,
}

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  /**
   * Contain Bcrypt hashed password of chanel if is private
   */
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.PUBLIC,
  })
  type: ChannelType;

  @CreateDateColumn()
  createDate: Date;

  @OneToMany(() => Message, (messages) => messages.channel)
  messages: Message[];
}

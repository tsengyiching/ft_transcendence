import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Message } from './messages.entity';

export enum ChanelType {
  PUBLIC = 1,
  PRIVATE = 0,
}

@Entity()
export class Chanel {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ChanelType,
    default: ChanelType.PUBLIC,
  })
  type: ChanelType;

  @CreateDateColumn()
  createDate: Date;

  @OneToMany(() => Message, (messages) => messages.chanel)
  messages: Message[];
}

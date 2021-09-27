import { User } from 'src/user/model/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Chanel } from './chanel.entity';

@Entity()
export class Message {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Chanel, (chanel) => chanel)
  chanel: Chanel;

  // Check if need to change
  //   @ManyToOne(() => User, (user) => user.messages)
  //   author: User;

  @Column()
  messages: string;

  @CreateDateColumn()
  createDate: Date;
}

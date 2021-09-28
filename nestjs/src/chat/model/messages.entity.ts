import { User } from 'src/user/model/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

  @ManyToOne((user) => User)
  @JoinColumn({ name: 'author' })
  author: User;

  @Column()
  messages: string;

  @CreateDateColumn()
  createDate: Date;
}

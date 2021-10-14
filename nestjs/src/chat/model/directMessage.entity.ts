import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/user/model/user.entity';

@Entity('directMessage')
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  receiverId: number;

  @ManyToOne(() => User)
  receiver: User;

  @Column()
  senderId: number;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  message: string;

  @CreateDateColumn()
  createDate: Date;
}

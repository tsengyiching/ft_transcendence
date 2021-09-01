import { User } from 'src/user/model/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  mode: string;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @ManyToOne(() => User, (user) => user.games)
  user: User;
}

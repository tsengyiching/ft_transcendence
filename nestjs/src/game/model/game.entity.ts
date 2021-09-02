import { User } from 'src/user/model/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true }) // change type later
  mode: string;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @ManyToMany(() => User, (user) => user.games)
  players: User[];
}

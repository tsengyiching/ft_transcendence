import { Game } from 'src/game/model/game.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number; //42 id ?

  @Column({ unique: true }) //handle error 500 later
  nickname: string;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @OneToMany(() => Game, (game) => game.user)
  games: Game[];
}

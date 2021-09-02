import { Game } from 'src/game/model/game.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number; //42 id ?

  @Column({ unique: true }) //handle error 500 later
  nickname: string;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @ManyToMany(() => Game, (game) => game.players)
  @JoinTable({ name: 'userGameHistory' })
  games: Game[];
}

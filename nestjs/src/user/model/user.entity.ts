import { Game } from 'src/game/model/game.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
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

  @ManyToMany(() => Game, (game) => game.users)
  @JoinTable({ name: 'userGameRecords' })
  games: Game[];

  @OneToMany(() => Game, (game) => game.winner)
  winnings: Game[];
}

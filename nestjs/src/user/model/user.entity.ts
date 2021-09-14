import { Game } from 'src/game/model/game.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import UserGameRecords from '../../game/model/userGameRecords.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number; //42 id ?

  @Column({ unique: true }) //handle error 500 later
  nickname: string;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @OneToMany(() => UserGameRecords, (userGameRecords) => userGameRecords.user)
  public userGameRecords!: UserGameRecords[];

  @OneToMany(() => Game, (game) => game.winner)
  victories: Game[];
}

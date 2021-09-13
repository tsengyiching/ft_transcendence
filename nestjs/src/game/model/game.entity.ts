import { User } from 'src/user/model/user.entity';
import UserGameRecords from 'src/game/model/userGameRecords.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

export enum GameStatus {
  ON = 1,
  OFF = 0,
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() // change type later
  mode: number;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.ON,
  })
  status: GameStatus;

  @OneToMany(() => UserGameRecords, (userGameRecords) => userGameRecords.game)
  public userGameRecords!: UserGameRecords[];

  @ManyToOne(() => User, (user) => user.victories)
  winner: User;
}

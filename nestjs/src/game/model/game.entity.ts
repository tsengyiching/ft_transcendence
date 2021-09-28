import { User } from 'src/user/model/user.entity';
import UserGameRecords from 'src/game/model/userGameRecords.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

export enum GameStatus {
  ONGOING = 1,
  FINISH = 0,
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() // need to define number meaning later, such as NORMAL = 1
  mode: number;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.ONGOING,
  })
  status: GameStatus;

  @OneToMany(() => UserGameRecords, (userGameRecords) => userGameRecords.game)
  public userGameRecords!: UserGameRecords[];

  @ManyToOne(() => User, (user) => user.victories)
  winner: User;
}

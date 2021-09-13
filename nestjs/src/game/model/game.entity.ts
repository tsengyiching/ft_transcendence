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

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() // change type later
  mode: number;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @OneToMany(() => UserGameRecords, (userGameRecords) => userGameRecords.game)
  public userGameRecords!: UserGameRecords[];

  @ManyToOne(() => User, (user) => user.victories)
  winner: User;
}

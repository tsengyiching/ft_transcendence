import { Game } from 'src/game/model/game.entity';
import UserRelationship from 'src/relationship/model/userRelationship.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import UserGameRecords from '../../game/model/userGameRecords.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id: number; //42 id ?

  @Column({ unique: true }) //handle error 500 later
  nickname: string;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;

  @OneToMany(() => UserGameRecords, (userGameRecords) => userGameRecords.user)
  public userGameRecords!: Promise<UserGameRecords[]>;

  @OneToMany(() => Game, (game) => game.winner)
  victories: Promise<Game[]>;

  @OneToMany(
    () => UserRelationship,
    (userRelationship) => userRelationship.user,
  )
  public userRelationship!: UserRelationship[];
}

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
  id: number;

  @Column()
  nickname: string;

  @CreateDateColumn()
  createDate: Date;

  @OneToMany(() => UserGameRecords, (userGameRecords) => userGameRecords.user)
  public userGameRecords!: UserGameRecords[];

  @OneToMany(() => Game, (game) => game.winner)
  victories: Game[];

  @OneToMany(
    () => UserRelationship,
    (userRelationship) => userRelationship.user,
  )
  public userRelationship!: UserRelationship[];
}

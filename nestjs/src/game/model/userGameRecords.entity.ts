import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from 'src/game/model/game.entity';
import { User } from 'src/user/model/user.entity';

@Entity('userGameRecords')
class UserGameRecords {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public userId!: number;

  @Column()
  public gameId!: number;

  @Column()
  public score?: number;

  @ManyToOne(() => User, (user) => user.userGameRecords)
  public user!: Promise<User>;

  @ManyToOne(() => Game, (game) => game.userGameRecords)
  public game!: Promise<Game>;
}

export default UserGameRecords;

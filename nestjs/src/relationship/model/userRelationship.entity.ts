import { User } from 'src/user/model/user.entity';
import { Relationship } from './relationship.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('userRelationship')
class UserRelationship {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public userId!: number;

  @Column()
  public relationshipId!: number;

  @ManyToOne(() => User, (user) => user.userRelationship)
  public user!: User;

  @ManyToOne(
    () => Relationship,
    (relationship) => relationship.userRelationship,
    {
      onDelete: 'CASCADE',
    },
  )
  public relationship!: Promise<Relationship>;
}

export default UserRelationship;

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import UserRelationship from './userRelationship.entity';

export enum RelationshipAction {
  ADDFRIEND = 0,
  ACCEPT = 1,
  REJECT = 2,
  UNFRIEND = 3,
  BLOCK = 4,
  UNBLOCK = 5,
}

export enum RelationshipStatus {
  NOTCONFIRMED = 0,
  FRIEND = 1,
  BLOCK = 2,
}

@Entity()
export class Relationship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RelationshipAction })
  action: RelationshipAction;

  @CreateDateColumn()
  createDate: Date;

  @Column({
    type: 'enum',
    enum: RelationshipStatus,
  })
  status: RelationshipStatus;

  @OneToMany(
    () => UserRelationship,
    (userRelationship) => userRelationship.relationship,
  )
  public userRelationship!: UserRelationship[];
}

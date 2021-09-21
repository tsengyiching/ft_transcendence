import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import UserRelationship from './userRelationship.entity';

export enum RelationshipStatus {
  NOTCONFIRMED = 0,
  FRIEND = 1,
  BLOCK = 2,
}

@Entity()
export class Relationship {
  @PrimaryGeneratedColumn()
  id: number;

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
    {
      cascade: true,
    },
  )
  public userRelationship!: Promise<UserRelationship[]>;
}

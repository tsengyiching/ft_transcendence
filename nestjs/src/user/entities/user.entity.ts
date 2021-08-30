import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  // @Column()
  // auth42: string;

  // @Column()
  // authGoogle: string;

  @Column()
  nickname: string;

  @CreateDateColumn() //{ select: false } not to show on query
  createDate: Date;

  // @Column()
  // photo: string;

  // @Column()
  // token: string;

  // @Column()
  // status: string;
}

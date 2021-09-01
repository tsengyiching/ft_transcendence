import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  userId: number; //42 id ?

  // @Column({ unique: true })
  // fortyTwoId: string;

  @Column({ unique: true })
  nickname: string;

  @CreateDateColumn() //{ select: false } not to show on query result
  createDate: Date;
}

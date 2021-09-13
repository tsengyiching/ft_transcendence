import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { CreateUserDto } from '../model/create-user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /*
   ** getAll returns users with details
   */
  getAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['userGameRecords'] });
  }

  /*
   ** getOneById returns the user
   */
  async getOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  /*
   ** getUserProfileById returns the user's game records, friend list and status
   */
  async getUserProfileById(id: number) {
    const user = this.userRepository.find({
      where: { id: id },
      relations: ['userGameRecords', 'victories'],
    });
    if (user) {
      return user;
    }
    throw new HttpException('This user does not exist', HttpStatus.NOT_FOUND);
  }

  /*
   ** createUser returns the new user (still have to modify with auth)
   */
  createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create({ ...createUserDto });
    return this.userRepository.save(newUser);
  }

  /*
   ** updateUserNickname modifies the user's nickname which should be unique
   */
  async updateUserNickname(
    id: number,
    CreateUserDto: CreateUserDto,
  ): Promise<User> {
    const user = await this.getOneById(id);
    user.nickname = CreateUserDto.nickname;
    return this.userRepository.save(user);
  }

  // async deleteUser(id: number): Promise<User> {
  //   const user = await this.getOneById(id);
  //   return this.userRepository.remove(user);
  // }

  // async follow(id: number, addFriendDto: AddFriendDto): Promise<User> {
  //   const user = await this.getOneById(id);
  //   const following = await this.getOneById(addFriendDto.friendId);
  //   user.following = [following];
  //   return this.userRepository.save(user);
  // }

  // async getFollower(id: number): Promise<User> {
  //   const user = await this.userRepository.findOne(id, {
  //     relations: ['followers'],
  //   });
  //   return user;
  // }

  // async getFollowing(id: number): Promise<User> {
  //   const user = await this.userRepository.findOne(id, {
  //     relations: ['following'],
  //   });
  //   return user;
  // }
  // getHello(id: number): string {
  //   console.log(id);
  //   return 'Hello World!';
  // }
}

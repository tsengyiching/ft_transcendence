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
   ** getAll returns all users with their game records
   */
  getAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['games'] });
  }

  /*
   ** getOneById returns the user's basic info without game records
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
   ** getUserGameRecordsById returns the user's basic info and game records
   */
  async getUserGameRecordsById(id: number): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.games', 'games')
      .loadRelationCountAndMap('user.gamesCount', 'user.games')
      .where('user.id = :id', { id })
      .getOne();
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create({ ...createUserDto });
    return this.userRepository.save(newUser);
  }

  async updateUser(id: number, CreateUserDto: CreateUserDto): Promise<User> {
    const user = await this.getOneById(id);
    user.nickname = CreateUserDto.nickname;
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<User> {
    const user = await this.getOneById(id);
    return this.userRepository.remove(user);
  }
  // getHello(id: number): string {
  //   console.log(id);
  //   return 'Hello World!';
  // }
}

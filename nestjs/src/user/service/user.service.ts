import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { CreateUserDto } from '../model/create-user.dto';
import { Repository } from 'typeorm';
import { ChangeUserNameDto } from '../model/change-username.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /*
   ** getAll returns users with details
   */
  getAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createDate: 'ASC' } });
  }

  /*
   ** getOneById returns the user
   */
  async getOneById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  /*
   ** getUserProfileById returns the user's id, nickname and createDate
   ** ! add avatar and status later
   */
  async getUserProfileById(id: number) {
    const user = await this.userRepository.findOne(id);
    if (user) {
      return user;
    }
    throw new HttpException('This user does not exist', HttpStatus.NOT_FOUND);
  }

  /*
   ** createUser returns the new user
   */
  createUser(profile: any): Promise<User> {
    const newUser = this.userRepository.create();

    newUser.id = profile.id;
    newUser.nickname = profile.login;
    // newUser.avatar = profile.photos;  // ! Add later

    return this.userRepository.save(newUser);
  }

  /*
   ** createUser locally, it returns the new user
   ** have to delete later
   */
  createUserWithDto(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create({ ...createUserDto });
    return this.userRepository.save(newUser);
  }

  /*
   ** updateUserNickname modifies the user's nickname which should be unique
   */
  async changeUserName(
    id: number,
    changeUserNameDto: ChangeUserNameDto,
  ): Promise<User> {
    const user = await this.getOneById(id);
    user.nickname = changeUserNameDto.nickname;
    return this.userRepository.save(user);
  }
}

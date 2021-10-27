import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnlineStatus, User } from '../model/user.entity';
import { CreateUserDto } from '../model/create-user.dto';
import { Repository, UpdateResult } from 'typeorm';
import { ChangeUserNameDto } from '../model/change-username.dto';
import { ChangeUserAvatarDto } from '../model/change-useravatar.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  getAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createDate: 'ASC' } });
  }

  async getAllWithConditions(id: number): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :Id', { Id: id })
      .select(['user.id', 'user.nickname', 'user.avatar', 'user.userStatus'])
      .orderBy('id', 'ASC')
      .getMany();
  }

  /*
   ** getOneById returns the user
   */
  getOneById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  /*
   ** ! add avatar and status later
   */
  async getUserProfileById(id: number) {
    const user = await this.userRepository.findOne(id);
    if (user) {
      return user;
    }
    throw new HttpException(
      `This user ${id} does not exist.`,
      HttpStatus.NOT_FOUND,
    );
  }

  createUser(profile: any): Promise<User> {
    const newUser = this.userRepository.create();
    newUser.id = profile.id;
    newUser.nickname = profile.login;
    newUser.email = profile.email;
    newUser.avatar = profile.image_url;
    newUser.userStatus = OnlineStatus.AVAILABLE;
    return this.userRepository.save(newUser);
  }

  /*
   ** Test only, delete later
   */
  createUserWithDto(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create({ ...createUserDto });
    newUser.isTwoFactorAuthenticationEnabled = false;
    newUser.userStatus = OnlineStatus.AVAILABLE;
    return this.userRepository.save(newUser);
  }

  async changeUserName(
    id: number,
    changeUserNameDto: ChangeUserNameDto,
  ): Promise<User> {
    const user = await this.getOneById(id);
    if (user.nickname === changeUserNameDto.nickname) {
      throw new HttpException(
        `Same user nickname is entered !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const allUsers = await this.getUserNameList();
    if (allUsers.includes(changeUserNameDto.nickname)) {
      throw new HttpException(
        `This nickname has been taken, please choose a new one !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    user.nickname = changeUserNameDto.nickname;
    return this.userRepository.save(user);
  }

  async changeUserAvatar(
    id: number,
    changeUserAvatarDto: ChangeUserAvatarDto,
  ): Promise<User> {
    const user = await this.getOneById(id);
    user.avatar = changeUserAvatarDto.avatar;
    return this.userRepository.save(user);
  }

  async setTwoFactorAuthenticationSecret(
    secret: string,
    userId: number,
  ): Promise<UpdateResult> {
    return this.userRepository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: number): Promise<UpdateResult> {
    return this.userRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  async isUserTwoFactorAuthEnabled(userId: number): Promise<boolean> {
    const userData = await this.getOneById(userId);
    if (userData.isTwoFactorAuthenticationEnabled === true) {
      return true;
    }
    return false;
  }

  /**
   * Change all users status to offline.
   */
  async resetUserStatus() {
    this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ userStatus: OnlineStatus.OFFLINE })
      .where('userStatus != :status', { status: OnlineStatus.OFFLINE })
      .execute();
  }
  /**
   * Change user status to specifique value.
   */
  async setUserStatus(userId: number, status: OnlineStatus) {
    this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ userStatus: status })
      .where('id = :id', { id: userId })
      .execute();
  }

  /****************************************************************************/
  /*                                 utils                                    */
  /****************************************************************************/

  async getUserNameList(): Promise<string[]> {
    const users = await this.getAll();
    const names = users.map((obj) => obj.nickname);
    return names;
  }

  async getUserIdByName(name: string): Promise<number> {
    const users = await this.getAll();
    const id = users
      .filter((obj) => obj.nickname === name)
      .map((obj) => obj.id);

    if (id.length === 0) {
      throw new HttpException(
        'User with this name does not exist.',
        HttpStatus.NOT_FOUND,
      );
    }
    return id[0];
  }
}

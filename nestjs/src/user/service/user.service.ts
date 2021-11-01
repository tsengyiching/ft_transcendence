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

  /**
   * getAll
   * @returns : all users
   */
  getAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'nickname', 'avatar', 'createDate', 'userStatus', 'email'],
      order: { createDate: 'ASC' },
    });
  }

  /**
   * getOneById
   * @param : user id
   * @returns : user
   */
  getOneById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  /**
   * getUserProfileById
   * @param : user id
   * @returns : user or throw error
   */
  async getUserProfileById(id: number): Promise<User> {
    const user = await this.userRepository.findOne(id, {
      select: ['id', 'nickname', 'avatar', 'createDate', 'userStatus', 'email'],
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      `This user ${id} does not exist.`,
      HttpStatus.NOT_FOUND,
    );
  }

  /**
   * createUser
   * @param : 42 profile payload
   * @returns : user
   */
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

  /**
   * changeUserName
   * @param : user id and new nickname
   * @returns : user
   */
  async changeUserName(
    id: number,
    changeUserNameDto: ChangeUserNameDto,
  ): Promise<User> {
    const user = await this.getOneById(id);
    if (!user) {
      throw new HttpException(
        `This User ${id} does not exist !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.nickname === changeUserNameDto.nickname) {
      throw new HttpException(
        `${user.nickname} is your current nickname !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const allUsers = await this.getUserNameList();
    if (allUsers.includes(changeUserNameDto.nickname)) {
      throw new HttpException(
        `${changeUserNameDto.nickname} has been taken, please choose a new one !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    user.nickname = changeUserNameDto.nickname;
    return this.userRepository.save(user);
  }

  /**
   * changeUserAvatar
   * @param : user id and new avatar url
   * @returns : user
   */
  async changeUserAvatar(
    id: number,
    changeUserAvatarDto: ChangeUserAvatarDto,
  ): Promise<User> {
    const user = await this.getOneById(id);
    if (!user) {
      throw new HttpException(
        `This User ${id} does not exist !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.avatar === changeUserAvatarDto.avatar) {
      throw new HttpException(
        `${user.avatar} is your current avatar url!`,
        HttpStatus.BAD_REQUEST,
      );
    }
    user.avatar = changeUserAvatarDto.avatar;
    return this.userRepository.save(user);
  }

  /**
   * setTwoFactorAuthenticationSecret
   * @param : user id and secret
   * @returns : update info
   */
  setTwoFactorAuthenticationSecret(
    secret: string,
    userId: number,
  ): Promise<UpdateResult> {
    return this.userRepository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  /**
   * turnOnTwoFactorAuthentication
   * @param : user id
   * @returns : update info
   */
  turnOnTwoFactorAuthentication(userId: number): Promise<UpdateResult> {
    return this.userRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  /**
   * isUserTwoFactorAuthEnabled
   * @param : user id
   * @returns : boolean
   */
  async isUserTwoFactorAuthEnabled(id: number): Promise<boolean> {
    const user = await this.getOneById(id);
    if (!user) {
      throw new HttpException(
        `This User ${id} does not exist !`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.isTwoFactorAuthenticationEnabled === true) {
      return true;
    }
    return false;
  }

  /**
   * Change all users status to offline.
   */
  resetUserStatus(): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ userStatus: OnlineStatus.OFFLINE })
      .where('userStatus != :status', { status: OnlineStatus.OFFLINE })
      .execute();
  }

  /**
   * Change user status to specific value.
   */
  setUserStatus(userId: number, status: OnlineStatus): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ userStatus: status })
      .where('id = :id', { id: userId })
      .execute();
  }

  /****************************************************************************/
  /*                                 utils                                    */
  /****************************************************************************/

  getAllWithConditions(id: number): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :Id', { Id: id })
      .select(['user.id', 'user.nickname', 'user.avatar', 'user.userStatus'])
      .orderBy('id', 'ASC')
      .getMany();
  }

  async getUserNameList(): Promise<string[]> {
    const users = await this.getAll();
    const names = users.map((obj) => obj.nickname);
    return names;
  }
}

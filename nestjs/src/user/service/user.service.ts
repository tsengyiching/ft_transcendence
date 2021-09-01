import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { CreateUserDto } from '../model/create-user.dto';
import { Repository } from 'typeorm';
import { GameService } from 'src/game/service/game.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(GameService) private readonly gameService: GameService,
  ) {}

  getAll(): Promise<User[]> {
    return this.userRepository.find(/*{relations: ['']}*/);
  }

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

  createUser(CreateUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create({ ...CreateUserDto });
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

  async joinNewGame(id: number): Promise<User> {
    const game1 = await this.gameService.createGame();
    const game2 = await this.gameService.createGame();
    const user = await this.getOneById(id);
    user.games = [game1, game2];
    return this.userRepository.save(user);
  }
}

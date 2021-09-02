import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { CreateGameDto } from '../model/create-game.dto';
import { Game } from '../model/game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  getAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async getOneById(id: number): Promise<Game> {
    const user = await this.gameRepository.findOne(id);
    if (user) {
      return user;
    }
    throw new HttpException(
      'Game with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async createGame(createGameDto: CreateGameDto): Promise<Game> {
    const newGame = await this.gameRepository.create();
    const leftUser = await this.userService.getOneById(
      createGameDto.leftUserId,
    );
    const rightUser = await this.userService.getOneById(
      createGameDto.rightUserId,
    );
    newGame.players = [leftUser, rightUser];
    return this.gameRepository.save(newGame);
  }
}

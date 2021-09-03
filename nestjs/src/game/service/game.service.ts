import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { AddGameWinnerDto } from '../model/add-gameWinner.dto';
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
    const game = await this.gameRepository.findOne(id);
    if (game) {
      return game;
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
    newGame.users = [leftUser, rightUser];
    return this.gameRepository.save(newGame);
  }

  async addGameWinner(
    id: number,
    addGameWinnerDto: AddGameWinnerDto,
  ): Promise<Game> {
    const game = await this.getOneById(id);
    const winner = await this.userService.getOneById(
      addGameWinnerDto.winnerUserId,
    );
    game.winner = winner;
    return this.gameRepository.save(game);
  }
}

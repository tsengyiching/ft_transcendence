import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserGameRecords from 'src/game/model/userGameRecords.entity';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { InsertGameResultDto } from '../model/insert-gameResult.dto';
import { CreateGameDto } from '../model/create-game.dto';
import { Game, GameStatus } from '../model/game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(UserGameRecords)
    private userGameRecords: Repository<UserGameRecords>,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  /*
   ** getAll returns games with details
   */
  getAll(): Promise<Game[]> {
    return this.gameRepository.find({
      relations: ['userGameRecords', 'winner'],
    });
  }

  /*
   ** getOneById returns the game with details
   */
  async getOneById(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne(id, {
      relations: ['userGameRecords', 'winner'],
    });
    if (game) {
      return game;
    }
    throw new HttpException(
      'Game with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  /*
   ** createGame returns the new game
   */
  async createGame(createGameDto: CreateGameDto): Promise<Game> {
    const newGame = await this.gameRepository.create();
    newGame.mode = createGameDto.mode;
    await this.gameRepository.save(newGame);
    const leftUser = await this.userGameRecords.create();
    leftUser.gameId = newGame.id;
    leftUser.userId = createGameDto.leftUserId;
    leftUser.score = 0;
    await this.userGameRecords.save(leftUser);

    const rightUser = await this.userGameRecords.create();
    rightUser.gameId = newGame.id;
    rightUser.userId = createGameDto.rightUserId;
    rightUser.score = 0;
    await this.userGameRecords.save(rightUser);
    return newGame;
  }

  /*
   ** insertGameResult inserts game result with scores and a winner
   ** sets game status off
   ** returns game
   */
  async insertGameResult(
    id: number,
    insertGameResultDto: InsertGameResultDto,
  ): Promise<Game> {
    const gameRecord = await this.userGameRecords.find({ gameId: id });
    gameRecord[0].score = insertGameResultDto.leftUserScore;
    gameRecord[1].score = insertGameResultDto.rightUserScore;
    await this.userGameRecords.save(gameRecord);

    const game = await this.getOneById(id);
    let winner;
    if (gameRecord[0].score > gameRecord[1].score) {
      winner = await this.userService.getOneById(gameRecord[0].userId);
    } else {
      winner = await this.userService.getOneById(gameRecord[1].userId);
    }
    game.winner = winner;
    game.status = GameStatus.FINISH;
    return this.gameRepository.save(game);
  }
}

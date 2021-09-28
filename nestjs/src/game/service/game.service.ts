import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserGameRecords from 'src/game/model/userGameRecords.entity';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { InsertGameResultDto } from '../model/insert-gameResult.dto';
import { CreateGameDto } from '../model/create-game.dto';
import { Game, GameStatus } from '../model/game.entity';
import { User } from 'src/user/model/user.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(UserGameRecords)
    private userGameRecords: Repository<UserGameRecords>,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  getAll(): Promise<Game[]> {
    return this.gameRepository.find({
      relations: ['userGameRecords', 'winner'],
      order: { createDate: 'DESC' },
    });
  }

  getOngoingGames(): Promise<Game[]> {
    return this.gameRepository.find({
      where: { status: GameStatus.ONGOING },
      relations: ['userGameRecords'],
      order: { createDate: 'DESC' },
    });
  }

  getOneById(id: number): Promise<Game> {
    return this.gameRepository.findOne(id, {
      relations: ['userGameRecords', 'winner'],
    });
  }

  getUserGameRecords(id: number): Promise<UserGameRecords[]> {
    return this.userGameRecords.find({
      where: { userId: id, game: { status: GameStatus.FINISH } },
      relations: ['game', 'game.userGameRecords', 'game.winner'],
      order: { gameId: 'DESC' },
    });
  }

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

  async insertGameResult(
    id: number,
    insertGameResultDto: InsertGameResultDto,
  ): Promise<Game> {
    const game = await this.getOneById(id);
    if (game.status === GameStatus.FINISH) {
      throw new HttpException(
        'This game has already inserted results, can not modify scores again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const gameRecord = await this.userGameRecords.find({ gameId: id });
    gameRecord[0].score = insertGameResultDto.leftUserScore;
    gameRecord[1].score = insertGameResultDto.rightUserScore;
    await this.userGameRecords.save(gameRecord);

    let winner: User;
    if (gameRecord[0].score > gameRecord[1].score) {
      winner = await this.userService.getOneById(gameRecord[0].userId);
    } else if (gameRecord[0].score < gameRecord[1].score) {
      winner = await this.userService.getOneById(gameRecord[1].userId);
    }
    game.winner = winner;
    game.status = GameStatus.FINISH;
    return this.gameRepository.save(game);
  }
}

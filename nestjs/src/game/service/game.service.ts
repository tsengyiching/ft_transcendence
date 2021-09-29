import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserGameRecords from 'src/game/model/userGameRecords.entity';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { InsertGameResultDto } from '../model/insert-gameResult.dto';
import { CreateGameDto } from '../model/create-game.dto';
import { SendGameDto } from '../model/send-game.dto';
import { Game, GameStatus } from '../model/game.entity';
import { User } from 'src/user/model/user.entity';
import { SendOngoingGameDto } from '../model/send-ongoging-game.dto';
import { SendUserGameRecordsDto } from '../model/send-user-game-records.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(UserGameRecords)
    private userGameRecords: Repository<UserGameRecords>,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  async getAll(): Promise<SendGameDto[]> {
    const games = await this.gameRepository.find({
      relations: ['userGameRecords', 'winner'],
      order: { createDate: 'DESC' },
    });
    const ret = games.map((data) => {
      const obj = {
        id: data.id,
        mode: data.mode,
        status: data.status === 1 ? 'Ongoing' : 'Finish',
        createDate: data.createDate,
        updateDate: data.updateDate,
        leftUserId: data.userGameRecords[0].userId,
        leftUserScore: data.userGameRecords[0].score,
        rightUserId: data.userGameRecords[1].userId,
        rightUserScore: data.userGameRecords[1].score,
        winnerId: data.winner === null ? null : data.winner.id,
      };
      return obj;
    });
    return ret;
  }

  async getOngoingGames(): Promise<SendOngoingGameDto[]> {
    const games = await this.gameRepository.find({
      where: { status: GameStatus.ONGOING },
      relations: ['userGameRecords'],
      order: { createDate: 'DESC' },
    });
    const ret = games.map((data) => {
      const obj = {
        id: data.id,
        mode: data.mode,
        createDate: data.createDate,
        leftUserId: data.userGameRecords[0].userId,
        rightUserId: data.userGameRecords[1].userId,
      };
      return obj;
    });
    return ret;
  }

  async getGameById(id: number): Promise<SendGameDto> {
    const game = await this.gameRepository.find({
      where: { id: id },
      relations: ['userGameRecords', 'winner'],
    });
    const ret = game.map((data) => {
      const obj = {
        id: data.id,
        mode: data.mode,
        status: data.status === 1 ? 'Ongoing' : 'Finish',
        createDate: data.createDate,
        updateDate: data.updateDate,
        leftUserId: data.userGameRecords[0].userId,
        leftUserScore: data.userGameRecords[0].score,
        rightUserId: data.userGameRecords[1].userId,
        rightUserScore: data.userGameRecords[1].score,
        winnerId: data.winner === null ? null : data.winner.id,
      };
      return obj;
    });
    return ret[0];
  }

  async getUserGameRecords(id: number): Promise<SendUserGameRecordsDto[]> {
    const games = await this.userGameRecords.find({
      where: { userId: id, game: { status: GameStatus.FINISH } },
      relations: ['game', 'game.userGameRecords', 'game.winner'],
      order: { gameId: 'DESC' },
    });
    const ret = games.map((data) => {
      const oppo = data.game.userGameRecords.filter(
        (data) => data.userId !== id,
      );
      const obj = {
        gameId: data.gameId,
        mode: data.game.mode,
        createDate: data.game.createDate,
        updateDate: data.game.updateDate,
        userScore: data.score,
        opponentId: oppo[0].userId,
        opponentScore: oppo[0].score,
        userGameStatus: data.game.winner.id === id ? 'Won' : 'Lost',
      };
      return obj;
    });
    return ret;
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
    const gameFinish = await this.getOneById(id);
    gameFinish.winner = winner;
    gameFinish.status = GameStatus.FINISH;
    return this.gameRepository.save(gameFinish);
  }

  /*
   ** getOneById returns the game detail
   ** util only
   */
  getOneById(id: number): Promise<Game> {
    return this.gameRepository.findOne(id, {
      relations: ['userGameRecords', 'winner'],
    });
  }
}

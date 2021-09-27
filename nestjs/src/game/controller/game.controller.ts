import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InsertGameResultDto } from '../model/insert-gameResult.dto';
import { CreateGameDto } from '../model/create-game.dto';
import { Game } from '../model/game.entity';
import { GameService } from '../service/game.service';
import UserGameRecords from '../model/userGameRecords.entity';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  /*
   ** getAll returns all game records
   */
  @Get('all')
  getGames(): Promise<Game[]> {
    return this.gameService.getAll();
  }

  /*
   ** getOngoingGames returns current games
   */
  @Get('ongoing')
  getOngoingGames(): Promise<Game[]> {
    return this.gameService.getOngoingGames();
  }

  /*
   ** getOneById returns the game with details
   ** parameter id : game's id
   */
  @Get(':id')
  getGameById(@Param('id', ParseIntPipe) id: number): Promise<Game> {
    return this.gameService.getOneById(id);
  }

  /*
   ** getUserGameRecords returns user's finish game
   ** parameter id : user's id
   */
  @Get('/userRecords/:id')
  getUserGameRecords(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserGameRecords[]> {
    return this.gameService.getUserGameRecords(id);
  }

  /*
   ** createGame returns the new game
   ** see createGameDto for format
   */
  @Post()
  createGame(@Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gameService.createGame(createGameDto);
  }

  /*
   ** insertGameResult inserts game result with scores and a winner
   ** sets game status off
   ** returns game
   ** parameter game id and see insertGameResultDto to insert scores
   */
  @Patch(':id')
  insertGameResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() insertGameResultDto: InsertGameResultDto,
  ): Promise<Game> {
    return this.gameService.insertGameResult(id, insertGameResultDto);
  }
}

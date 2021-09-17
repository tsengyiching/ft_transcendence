import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { InsertGameResultDto } from '../model/insert-gameResult.dto';
import { CreateGameDto } from '../model/create-game.dto';
import { Game } from '../model/game.entity';
import { GameService } from '../service/game.service';
import UserGameRecords from '../model/userGameRecords.entity';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get()
  getGames(): Promise<Game[]> {
    return this.gameService.getAll();
  }

  @Get(':id')
  getGameById(@Param('id', ParseIntPipe) id: number): Promise<Game> {
    return this.gameService.getOneById(id);
  }

  @Get('/userRecords/:id')
  getUserGameRecords(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserGameRecords[]> {
    return this.gameService.getUserGameRecords(id);
  }

  @Post()
  createGame(@Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gameService.createGame(createGameDto);
  }

  @Put(':id')
  insertGameResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() insertGameResultDto: InsertGameResultDto,
  ): Promise<Game> {
    return this.gameService.insertGameResult(id, insertGameResultDto);
  }
}

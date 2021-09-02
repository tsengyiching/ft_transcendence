import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateGameDto } from '../model/create-game.dto';
import { Game } from '../model/game.entity';
import { GameService } from '../service/game.service';

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

  @Post()
  createGame(@Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gameService.createGame(createGameDto);
  }
}

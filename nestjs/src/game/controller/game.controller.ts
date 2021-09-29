import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InsertGameResultDto } from '../model/insert-gameResult.dto';
import { CreateGameDto } from '../model/create-game.dto';
import { Game } from '../model/game.entity';
import { GameService } from '../service/game.service';
import { CurrentUser } from 'src/auth/decorator/currrent.user.decorator';
import { User } from 'src/user/model/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SendGameDto } from '../model/send-game.dto';
import { SendOngoingGameDto } from '../model/send-ongoging-game.dto';
import { SendUserGameRecordsDto } from '../model/send-user-game-records.dto';

@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  /*
   ** getAll returns all game records
   */
  @Get('all')
  getGames(): Promise<SendGameDto[]> {
    return this.gameService.getAll();
  }

  /*
   ** getOngoingGames returns current games
   */
  @Get('ongoing')
  getOngoingGames(): Promise<SendOngoingGameDto[]> {
    return this.gameService.getOngoingGames();
  }

  /*
   ** getGameById returns the game with details
   ** parameter id : game's id
   */
  @Get(':id')
  getGameById(@Param('id', ParseIntPipe) id: number): Promise<SendGameDto> {
    return this.gameService.getGameById(id);
  }

  /*
   ** getUserGameRecords returns user's finish game
   ** parameter id : user's id
   */
  @Get('me/records')
  getMyGameRecords(
    @CurrentUser() user: User,
  ): Promise<SendUserGameRecordsDto[]> {
    return this.gameService.getUserGameRecords(user.id);
  }

  /*
   ** getUserGameRecords returns user's finish game
   ** parameter id : user's id
   */
  @Get(':id/records')
  getUserGameRecords(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SendUserGameRecordsDto[]> {
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

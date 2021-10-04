import { IsEnum, IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { GameMode } from './game.entity';

export class CreateGameDto {
  @IsEnum(GameMode)
  mode: GameMode;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(1000000)
  leftUserId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(1000000)
  rightUserId: number;
}

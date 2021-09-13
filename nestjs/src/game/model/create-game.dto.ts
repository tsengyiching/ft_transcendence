import { IsInt } from 'class-validator';

export class CreateGameDto {
  @IsInt()
  mode: number;
  @IsInt()
  leftUserId: number;
  @IsInt()
  rightUserId: number;
}

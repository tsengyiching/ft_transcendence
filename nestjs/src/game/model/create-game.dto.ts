import { IsInt } from 'class-validator';

export class CreateGameDto {
  @IsInt()
  leftUserId: number;
  @IsInt()
  rightUserId: number;
}

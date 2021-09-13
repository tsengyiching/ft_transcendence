import { IsInt } from 'class-validator';

export class InsertGameResultDto {
  @IsInt()
  winnerUserId: number;
  @IsInt()
  leftUserScore: number;
  @IsInt()
  rightUserScore: number;
}

import { IsInt } from 'class-validator';

export class InsertGameResultDto {
  @IsInt()
  leftUserScore: number;
  @IsInt()
  rightUserScore: number;
}

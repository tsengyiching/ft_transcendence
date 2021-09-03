import { IsInt } from 'class-validator';

export class AddGameWinnerDto {
  @IsInt()
  winnerUserId: number;
}

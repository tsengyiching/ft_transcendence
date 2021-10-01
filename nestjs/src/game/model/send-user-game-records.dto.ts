export class SendUserGameRecordsDto {
  gameId: number;
  mode: number;
  createDate: Date;
  updateDate: Date;
  userScore: number;
  opponentId: number;
  opponentScore: number;
  userGameStatus: string;
}

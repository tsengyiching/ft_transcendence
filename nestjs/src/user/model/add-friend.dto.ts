import { IsInt } from 'class-validator';

export class AddFriendDto {
  @IsInt()
  friendId: number;
}

import { IsInt } from 'class-validator';

export class LeaveChannelDto {
  @IsInt()
  channelId: number;
}

import { IsInt } from 'class-validator';

export class SetChannelAdminDto {
  @IsInt()
  channelId: number;

  @IsInt()
  participantId: number;
}

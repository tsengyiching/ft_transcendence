import { IsInt } from 'class-validator';

export class CreateChannelParticipantDto {
  @IsInt()
  channelId: number;
}

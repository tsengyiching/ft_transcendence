import { IsEnum, IsInt } from 'class-validator';
import { StatusInChannel } from '../model/channelParticipant.entity';

export class ChangeStatusDto {
  @IsInt()
  channelId: number;

  @IsInt()
  userId: number;

  @IsInt()
  statusExpiration: number;

  @IsEnum(StatusInChannel)
  status: StatusInChannel;
}

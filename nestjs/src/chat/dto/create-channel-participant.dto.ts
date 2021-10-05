import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ChannelRole } from '../model/channelParticipant.entity';

export class CreateChannelParticipantDto {
  // Optional
  @IsOptional()
  @IsInt()
  userId: number;
  @IsInt()
  channelID: number;

  @IsOptional()
  @IsEnum(ChannelRole)
  role: ChannelRole;
}

import { IsInt } from 'class-validator';

export class GeneralChannelDto {
  @IsInt()
  channelId: number;

  password: string;
}

import { IsEnum, IsInt } from 'class-validator';

export enum Option {
  ADD = 'Add',
  CHANGE = 'Change',
  REMOVE = 'Remove',
}

export class SetChannelPasswordDto {
  @IsInt()
  channelId: number;

  @IsEnum(Option)
  action: Option;

  password: string;
}

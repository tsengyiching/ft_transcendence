import { IsAlphanumeric, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateChannelDto {
  @IsAlphanumeric()
  @MaxLength(10)
  @IsNotEmpty()
  name: string;

  password: string;
}

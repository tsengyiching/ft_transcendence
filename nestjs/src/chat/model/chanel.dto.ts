import { IsAlphanumeric, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateChanelDto {
  @IsAlphanumeric()
  @MaxLength(10)
  @IsNotEmpty()
  name: string;

  password: string;
}

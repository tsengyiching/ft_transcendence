import { IsAlphanumeric, IsNotEmpty, MaxLength } from 'class-validator';

export class ChangeUserNameDto {
  @IsAlphanumeric()
  @MaxLength(10)
  @IsNotEmpty()
  nickname: string;
}

import { IsAlphanumeric, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsAlphanumeric()
  @MaxLength(10)
  @IsNotEmpty()
  nickname: string;
}

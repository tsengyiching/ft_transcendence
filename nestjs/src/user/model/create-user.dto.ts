import { IsAlphanumeric, IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  id: number;

  @IsAlphanumeric()
  @MaxLength(10)
  @IsNotEmpty()
  nickname: string;
}

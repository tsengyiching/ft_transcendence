import { IsAlphanumeric, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {
  id: number;
  @IsAlphanumeric()
  @MaxLength(10)
  @IsNotEmpty()
  nickname: string;
}

import { IsAlphanumeric, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsAlphanumeric()
  @MaxLength(10)
  name: string;
}

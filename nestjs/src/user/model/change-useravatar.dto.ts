import { IsNotEmpty, IsUrl } from 'class-validator';

export class ChangeUserAvatarDto {
  @IsNotEmpty()
  @IsUrl()
  avatar: string;
}

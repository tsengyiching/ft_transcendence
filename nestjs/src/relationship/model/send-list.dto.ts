import { OnlineStatus } from 'src/user/model/user.entity';

export class SendlistDto {
  userId: number;
  nickname: string;
  avatar: string;
  status: OnlineStatus;
}

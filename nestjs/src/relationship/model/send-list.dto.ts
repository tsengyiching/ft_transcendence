import { OnlineStatus } from 'src/user/model/user.entity';

export class SendlistDto {
  user_id: number;
  user_nickname: string;
  user_avatar: string;
  user_userStatus: OnlineStatus;
  relation_id: number;
}

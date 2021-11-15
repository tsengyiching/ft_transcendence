import { Injectable } from '@nestjs/common';
import { Ball, Paddle, Player, ObjectToCollide, Party } from './pong.interface';
import { UserService } from 'src/user/service/user.service';
import { OnlineStatus, User } from 'src/user/model/user.entity';

import {
  XR,
  XL,
  Y,
  LEFTMAXANGLE,
  LEFTLITTLEANGLE,
  RIGHTMAXANGLE,
  RIGHTLITTLEANGLE,
  H,
  W,
  FRAMERATE,
} from './pong.env';

@Injectable()
export class PongService {
  private parties: Party[] = [];

  getPartById(id: number) {
    return this.parties.find((e) => {e.id === id});
  }

  private setNewParty(id:number, p1: Player, p2: Player): Party {
    const newParty: Party = {
	  id: id,
      ball: {
        pos: { x: W * 0.5, y: H * 0.5 },
        radius: 15,
        vx: Math.random() > 0.5 ? 1 : -1,
        vy: 0,
        speed: 2,
        acceleration: 1,
      },
      paddleL: {
        h: H / 6,
        w: W * 0.02,
        pos: {
          x: W * 0.01,
          y: 0,
        },
        speed: 10, //TODO
      },
      paddleR: {
        h: H / 6,
        w: W * 0.02,
        pos: {
          x: W * 0.97,
          y: H - H / 6,
        },
        speed: 10, // TODO
      },
      scoreL: 0,
      scoreR: 0,
      lastp: false,
      lasty: false,
      pOne: p1,
      pTwo: p2,
    };
    return newParty;
  }

  private async createPlayerById(id:number, userService:UserService, paddle:number):Promise<Player> {
	try {
		const user: User = await userService.getOneById(id);
		let newPlayer:Player = {
			name: user.nickname,
			id: id,
  			avatar: user.avatar,
  			paddle: paddle,
  			score: 0,
  			up: false,
  			down: false
		}
		return newPlayer;
	}
	catch (error) {
		console.log(error);
	}
  } 
  /**
   *
   * @param pOne player one, gets left paddle
   * @param pTwo player two, gets right paddle
   * @returns id of the party ??(voir avec Felix) // TODO
   */
  async createNewParty(id: number, usersIdArr:number[], userService:UserService) {
	const pOne = await this.createPlayerById(usersIdArr[0], userService, 1);
	const pTwo = await this.createPlayerById(usersIdArr[1], userService, 2);
    this.parties.push(this.setNewParty(id, pOne, pTwo));
  }
}

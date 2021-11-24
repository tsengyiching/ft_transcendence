import { Injectable } from '@nestjs/common';
import { Ball, Paddle, Player, ObjectToCollide, Match } from './pong.interface';
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



function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class PongService {
  
  private matches: Match[] = [];
  
  getMatchById(id: number) {
    return this.matches.find((e) => {e.id === id});
  }

  getMatchIdByPlayerId(playerId:number) {
    return this.matches.find(e => e.pOne.id === playerId || e.pTwo.id === playerId).id;
  }

  private setNewMatch(id:number, p1: Player, p2: Player): Match {
    const newMatch: Match = {
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
      pOne: {...p1},
      pTwo: {...p2},
	  run: false,
    };
    return newMatch;
  }

  private async createPlayerById(id:number, userService:UserService, paddle:number):Promise<Player> {
	try {
		const user: User = await userService.getOneById(id);
		let newPlayer:Player = {
			name: user.nickname,
			id: id,
      socketId: '',
  			avatar: user.avatar,
  			paddle: paddle,
  			score: 0,
  			up: false,
  			down: false,
        ready: false
		}
		return newPlayer;
	}
	catch (error) {
		console.log(error);
	}
  }


  /**
   *
   * @param id Match id
   * @param userIdArr ids of the 2 players
   * @param userService YOU KNOW
   * @returns id of the Match ??(voir avec Felix) // TODO
   */
  async createNewMatch(id: number, usersIdArr:number[], userService:UserService) {
	const pOne = await this.createPlayerById(usersIdArr[0], userService, 1);
	const pTwo = await this.createPlayerById(usersIdArr[1], userService, 2);
    this.matches.push(this.setNewMatch(id, pOne, pTwo));
  }


  sendPlayersInfos(gameId) {
    const currentGame = this.matches.find(e => e.id === gameId)
    return {
      pLName:currentGame.pOne.name,
      pLAvatar:currentGame.pOne.avatar,
      pRName:currentGame.pTwo.name,
      pRAvatar:currentGame.pTwo.avatar,
    }
  }

  playersSetReady(gameId:number, playerId:number, socketId:string)
  {
    const currentGame = this.matches.find(e => e.id === gameId);
    if (playerId === currentGame.pOne.id)
    {
      currentGame.pOne.socketId = socketId;
      currentGame.pOne.ready = true;
    }
    if (playerId === currentGame.pTwo.id)
    {
      currentGame.pTwo.socketId = socketId;
      currentGame.pTwo.ready = true;
    }
  }

  playersReadyCheck(gameId) : boolean {
    const currentGame = this.matches.find(e => e.id === gameId);
    if (currentGame.pOne.ready && currentGame.pTwo.ready)
      return true;
    return false;
  }
}


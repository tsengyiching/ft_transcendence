import { Injectable } from '@nestjs/common';
import {
  Ball,
  Paddle,
  Player,
  ObjectToCollide,
  Match,
  Pos,
} from './pong.interface';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/model/user.entity';
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
import { Interval } from '@nestjs/schedule';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class PongService {
  private matches: Match[] = [];

  getMatchById(id: number) {
    return this.matches.find((e) => {
      e.id === id;
    });
  }

  getMatchIdByPlayerId(playerId: number) {
    return this.matches.find(
      (e) => e.pOne.id === playerId || e.pTwo.id === playerId,
    ).id;
  }

  private setNewMatch(id: number, p1: Player, p2: Player): Match {
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
      pOne: { ...p1 },
      pTwo: { ...p2 },
      run: false,
    };
    return newMatch;
  }

  private async createPlayerById(
    id: number,
    userService: UserService,
    paddle: number,
  ): Promise<Player> {
    try {
      const user: User = await userService.getOneById(id);
      const newPlayer: Player = {
        name: user.nickname,
        id: id,
        socketId: '',
        avatar: user.avatar,
        paddle: paddle,
        score: 0,
        up: false,
        down: false,
        ready: false,
      };
      return newPlayer;
    } catch (error) {
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
  async createNewMatch(
    id: number,
    usersIdArr: number[],
    userService: UserService,
  ) {
    const pOne = await this.createPlayerById(usersIdArr[0], userService, 1);
    const pTwo = await this.createPlayerById(usersIdArr[1], userService, 2);
    this.matches.push(this.setNewMatch(id, pOne, pTwo));
  }

  sendPlayersInfos(gameId) {
    const currentGame = this.matches.find((e) => e.id === gameId);
    return {
      pLName: currentGame.pOne.name,
      pLAvatar: currentGame.pOne.avatar,
      pRName: currentGame.pTwo.name,
      pRAvatar: currentGame.pTwo.avatar,
    };
  }

  playersSetReady(gameId: number, playerId: number, socketId: string) {
    const currentGame = this.matches.find((e) => e.id === gameId);
    if (playerId === currentGame.pOne.id) {
      currentGame.pOne.socketId = socketId;
      currentGame.pOne.ready = true;
    }
    if (playerId === currentGame.pTwo.id) {
      currentGame.pTwo.socketId = socketId;
      currentGame.pTwo.ready = true;
    }
  }

  playersReadyCheck(gameId): boolean {
    const currentGame = this.matches.find((e) => e.id === gameId);
    if (currentGame.pOne.ready && currentGame.pTwo.ready) return true;
    return false;
  }

  /**
   * GAME INFOS
   */

  setKeyValue(up: boolean, socketId: string, value: boolean) {
    this.matches.forEach((match) => {
      if (match.pOne.socketId === socketId) {
        if (up) match.pOne.up = value;
        else match.pOne.down = value;
      }
      if (match.pTwo.socketId === socketId) {
        if (up) match.pTwo.up = value;
        else match.pTwo.down = value;
      }
    });
  }

  gameInfos(matchId: number) {
    const currentGame = this.matches.find((e) => e.id === matchId);
    return {
      pOneY: currentGame.paddleL.pos.y,
      pTwoY: currentGame.paddleR.pos.y,
      ballX: currentGame.ball.pos.x,
      ballY: currentGame.ball.pos.y,
      scoreL: currentGame.scoreL,
      scoreR: currentGame.scoreR,
    };
  }

  /**
   * GAME CALCULATIONS BIG BRAIN
   */

  private ballCollisionToPaddle(
    ball: Ball,
    paddleL: Paddle,
    paddleR: Paddle,
  ): Pos {
    const rect: Pos = { x: ball.pos.x, y: ball.pos.y };
    let dist = 0;
    //if ball collide avec paddleL
    if (ball.pos.x - ball.radius <= paddleL.pos.x + paddleL.w) {
      rect.x =
        ball.pos.x < paddleL.pos.x
          ? paddleL.pos.x
          : ball.pos.x > paddleL.pos.x + paddleL.w
          ? paddleL.pos.x + paddleL.w
          : rect.x;
      rect.y =
        ball.pos.y < paddleL.pos.y
          ? paddleL.pos.y
          : ball.pos.y > paddleL.pos.y + paddleL.h
          ? paddleL.pos.y + paddleL.h
          : rect.y;
      dist = Math.sqrt(
        Math.pow(ball.pos.x - rect.x, 2) + Math.pow(ball.pos.y - rect.y, 2),
      );
      if (dist <= ball.radius) {
        // calc next vx and vy
        const relativeY = 1 - (rect.y - paddleL.pos.y) / (paddleL.h * 0.5);
        const angleRebound =
          Math.abs(relativeY) === 1
            ? -relativeY * LEFTMAXANGLE
            : -relativeY * LEFTLITTLEANGLE;
        return { x: Math.cos(angleRebound), y: Math.sin(angleRebound) }; ////////
      } else return { x: 0, y: 0 };
    } else if (ball.pos.x + ball.radius + ball.speed >= paddleR.pos.x) {
      console.log(ball.pos.x, paddleR.pos.x);
      rect.x =
        ball.pos.x < paddleR.pos.x
          ? paddleR.pos.x
          : ball.pos.x > paddleR.pos.x + paddleR.w
          ? paddleR.pos.x + paddleR.w
          : rect.x;
      rect.y =
        ball.pos.y < paddleR.pos.y
          ? paddleR.pos.y
          : ball.pos.y > paddleR.pos.y + paddleR.h
          ? paddleR.pos.y + paddleR.h
          : rect.y;
      dist = Math.sqrt(
        Math.pow(ball.pos.x - rect.x, 2) + Math.pow(ball.pos.y - rect.y, 2),
      );
      if (dist <= ball.radius) {
        const relativeY = 1 - (rect.y - paddleR.pos.y) / (paddleR.h * 0.5);
        const angleRebound =
          Math.abs(relativeY) === 1
            ? -relativeY * LEFTMAXANGLE
            : -relativeY * LEFTLITTLEANGLE;
        return { x: -Math.cos(angleRebound), y: Math.sin(angleRebound) }; ////////
      } else return { x: 0, y: 0 };
    }
    return { x: 0, y: 0 };
  }

  private ballCollisiontoWall(ball: Ball, wall: ObjectToCollide): number {
    if (ball.pos.x + ball.vx > wall.tr.x - ball.radius) {
      // si la balle touche le bord droit
      return XR;
    } else if (ball.pos.x + ball.vx <= wall.tl.x + ball.radius) {
      //si la balle touche le bord gauche
      return XL;
    } else if (
      ball.pos.y + ball.vy <= wall.tl.y + ball.radius || //si la balle touche le haut
      ball.pos.y + ball.vy >= wall.bl.y - ball.radius // si la balle touche en bas
    ) {
      return Y;
    } else return 0;
  }

  private afterGoalUpdate(matchId: number, scored: boolean) {
    this.matches.map((match) => {
      if (match.id === matchId) {
        match.ball = {
          pos: { x: W * 0.5, y: H * 0.5 },
          radius: 15,
          vx: Math.random() > 0.5 ? 1 : -1,
          vy: 0,
          speed: 2,
          acceleration: 1,
        };
        if (scored === true) {
          // player L
          match.scoreL++;
        } else if (!scored) match.scoreR++;
        match.lastp = false;
        match.lasty = false;
      }
    });
  }

  private afterGoalUpdateref(match: Match, scored: boolean) {
    match.ball = {
      pos: { x: W * 0.5, y: H * 0.5 },
      radius: 15,
      vx: Math.random() > 0.5 ? 1 : -1,
      vy: 0,
      speed: 2,
      acceleration: 1,
    };
    if (scored === true) {
      // player L
      match.scoreL++;
    } else if (!scored) match.scoreR++;
    match.lastp = false;
    match.lasty = false;
  }

  //   UpdateGame(gameId: number) {
  //     this.matches.forEach((match) => {
  //       if (match.id === gameId) {
  //         const touch = this.ballCollisionToPaddle(
  //           match.ball,
  //           match.paddleL,
  //           match.paddleR,
  //         );
  //         const mouv: number[] = [0, 0];

  //         mouv[0] =
  //           match.pOne.down && !match.pOne.up
  //             ? 1
  //             : match.pOne.up && !match.pOne.down
  //             ? -1
  //             : 0;
  //         mouv[1] =
  //           match.pTwo.down && !match.pTwo.up
  //             ? 1
  //             : match.pTwo.up && !match.pTwo.down
  //             ? -1
  //             : 0;
  //         if (touch.x || touch.y) {
  //           if (match.lastp === false) {
  //             match.ball.vx = touch.x;
  //             match.ball.vy = touch.y;
  //             match.lastp = true;
  //             if (mouv[0] || mouv[1]) match.ball.acceleration += 0.6;
  //           }
  //         } else {
  //           match.lastp = false;
  //           const toWall = this.ballCollisiontoWall(match.ball, {
  //             tl: { x: 0, y: 0 },
  //             tr: { x: W, y: 0 },
  //             bl: { x: 0, y: H },
  //             br: { x: W, y: H },
  //           });
  //           if (toWall === XR || toWall === XL) {
  //             return this.afterGoalUpdateref(match, !!(toWall === XL));
  //           } else if (toWall === Y && !match.lasty) {
  //             match.lasty = true;
  //             match.ball.vy *= -1;
  //           }
  //           if (toWall !== Y) {
  //             match.lasty = false;
  //           }
  //         }
  //         if (match.ball.acceleration > 1) {
  //           match.ball.acceleration -= 0.005;
  //         }
  //         match.ball.pos.x +=
  //           match.ball.vx * match.ball.speed * match.ball.acceleration;
  //         match.ball.pos.y +=
  //           match.ball.vy * match.ball.speed * match.ball.acceleration;
  //         if (mouv[0]) {
  //           match.paddleL.pos.y += mouv[0] * match.paddleL.speed;
  //           if (match.paddleL.pos.y < 0) match.paddleL.pos.y = 0;
  //           if (match.paddleL.pos.y + match.paddleL.h > H)
  //             match.paddleL.pos.y = H - match.paddleL.h;
  //         }
  //         if (mouv[1]) {
  //           match.paddleR.pos.y += mouv[1] * match.paddleR.speed;
  //           if (match.paddleR.pos.y < 0) match.paddleR.pos.y = 0;
  //           if (match.paddleR.pos.y + match.paddleR.h > H)
  //             match.paddleR.pos.y = H - match.paddleR.h;
  //         }
  //       }
  //     });
  //   }

  setGameRunning(socketId: string, running: boolean) {
    let matchId = -1;
    this.matches.forEach((match) => {
      if (
        match.pOne.socketId === socketId ||
        match.pTwo.socketId === socketId
      ) {
        console.log(match.id);
        match.run = running;
        matchId = match.id;
      }
    });
    return matchId;
  }

  @Interval('gameLoop', 1000 / FRAMERATE)
  updateGames() {
	  console.log('HELLO');
    this.matches.forEach((match) => {
      if (match.run) {
        console.log('RUNNING');
        const touch = this.ballCollisionToPaddle(
          match.ball,
          match.paddleL,
          match.paddleR,
        );
        const mouv: number[] = [0, 0];

        mouv[0] =
          match.pOne.down && !match.pOne.up
            ? 1
            : match.pOne.up && !match.pOne.down
            ? -1
            : 0;
        mouv[1] =
          match.pTwo.down && !match.pTwo.up
            ? 1
            : match.pTwo.up && !match.pTwo.down
            ? -1
            : 0;
        if (touch.x || touch.y) {
          if (match.lastp === false) {
            match.ball.vx = touch.x;
            match.ball.vy = touch.y;
            match.lastp = true;
            if (mouv[0] || mouv[1]) match.ball.acceleration += 0.6;
          }
        } else {
          match.lastp = false;
          const toWall = this.ballCollisiontoWall(match.ball, {
            tl: { x: 0, y: 0 },
            tr: { x: W, y: 0 },
            bl: { x: 0, y: H },
            br: { x: W, y: H },
          });
          if (toWall === XR || toWall === XL) {
            return this.afterGoalUpdateref(match, !!(toWall === XL));
          } else if (toWall === Y && !match.lasty) {
            match.lasty = true;
            match.ball.vy *= -1;
          }
          if (toWall !== Y) {
            match.lasty = false;
          }
        }
        if (match.ball.acceleration > 1) {
          match.ball.acceleration -= 0.005;
        }
        match.ball.pos.x +=
          match.ball.vx * match.ball.speed * match.ball.acceleration;
        match.ball.pos.y +=
          match.ball.vy * match.ball.speed * match.ball.acceleration;
        if (mouv[0]) {
          match.paddleL.pos.y += mouv[0] * match.paddleL.speed;
          if (match.paddleL.pos.y < 0) match.paddleL.pos.y = 0;
          if (match.paddleL.pos.y + match.paddleL.h > H)
            match.paddleL.pos.y = H - match.paddleL.h;
        }
        if (mouv[1]) {
          match.paddleR.pos.y += mouv[1] * match.paddleR.speed;
          if (match.paddleR.pos.y < 0) match.paddleR.pos.y = 0;
          if (match.paddleR.pos.y + match.paddleR.h > H)
            match.paddleR.pos.y = H - match.paddleR.h;
        }
      }
    });
  }
  // https://gamedev.stackexchange.com/questions/174240/server-game-loop
}

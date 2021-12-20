import { string } from '@hapi/joi';
import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { OnlineStatus, User } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { PongService } from './pong.game.service';
import { PongUsersService } from './pong.users.service';
import { FRAMERATE } from './pong.env';
import { GameService } from 'src/game/service/game.service';
import { GameMode } from 'src/game/model/game.entity';
import { parse } from 'cookie';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/auth/guard/ws.guard';
// https://www.generacodice.com/en/articolo/713202/how-can-i-find-the-response-time-latency-of-a-client-in-nodejs-with-sockets-socket-

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: 'http://' + process.env.DOMAIN_FRONTEND + '/*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseGuards(WsGuard)
export class PongGateway {
  constructor(
    private pongService: PongService,
    private authService: AuthService,
    private userService: UserService,
    private pongUsersService: PongUsersService,
    private gameService: GameService,
  ) {}

  @WebSocketServer() server: Socket;

  /**
   * Call after socket creation
   */
  async afterInit() {
    try {
      await this.gameService.finishGame();
    } catch (error) {
      console.log(error);
    }
  }

  async handleConnection(client: Socket) {
    let jwtCookie: string;
    if (client.handshake.headers.cookie)
      jwtCookie = parse(client.handshake.headers.cookie).jwt;
    if (jwtCookie !== undefined) {
      try {
        const user: User = await this.authService.getUserFromSocket(client);
        client.join(user.id.toString());
        this.pongUsersService.userConnect(user.id);
        const resp = this.pongUsersService.isInMatchmaking(user.id);
        client.emit('inMatchMaking', resp);
      } catch (error) {
        client.emit(`alert`, {
          alert: { type: `danger`, message: error.error },
        });
      }
    }
  }

  async handleDisconnect(client: Socket) {
    let jwtCookie: string;
    if (client.handshake.headers.cookie)
      jwtCookie = parse(client.handshake.headers.cookie).jwt;
    if (jwtCookie !== undefined) {
      try {
        const user: User = await this.authService.getUserFromSocket(client);
        client.leave(user.id.toString());
        const currentGame = this.pongService.userDiconnectFromGame(user.id);
        this.pongService.setDisconnected(user.id, false);
        if (currentGame) client.leave(currentGame.toString() + '-Game');
        await sleep(2000);
        const left = this.pongUsersService.userDisconnect(user.id);
        if (this.pongUsersService.isInMatchmaking(user.id) && !left) {
          this.pongUsersService.removePlayer(user.id);
        }
        if (this.pongUsersService.isInMatchmakingBonus(user.id) && !left) {
          this.pongUsersService.removePlayerBonus(user.id);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   *
   * @param client Socket de la fenetre qui se connecte au jeu (peut etre plusieur par joueur)
   * si le joueur n'est pas dans la file d'attente, l'ajoute et envoie l'info aux autres fenetre de ce joueur
   */
  @SubscribeMessage('matchmakingON')
  async enterMatchMakingRoom(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
	  console.log(user);
      if (user.userStatus === OnlineStatus.PALYING) {
        client.emit(`alert`, {
          alert: { type: `danger`, message: 'You are already in a game' },
        });
        return;
      }
      console.log('New Player Joins', user.id.toString());
      //client.emit('inMatchMaking', true);
      this.server.to(user.id.toString()).emit('inMatchMaking', true);
      this.pongUsersService.addNewPlayer(user.id);
      await sleep(2000);
      const userArray = await this.pongUsersService.makeMatchMaking();
      if (userArray) {
        console.log(userArray);
        const GameId = this.pongUsersService.createGameId();
        this.pongService.createNewMatch(
          GameId,
          userArray,
          this.userService,
          false,
        );
        userArray.forEach((e) => {
          this.server.to(e.toString()).emit('inMatchMaking', false);
          this.server.to(e.toString()).emit('inGame', GameId);
        });
      }
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  @SubscribeMessage('matchmakingOFF')
  async leaveMatchMakingRoom(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);

      console.log(`${user.id} ${user.nickname} left Match Making.`);
      this.server.to(user.id.toString()).emit('inMatchMaking', false);
      this.pongUsersService.removePlayer(user.id);
      this.pongUsersService.removePlayerBonus(user.id);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('isInMatchmaking?')
  async isInMatchmaking(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      const resp = this.pongUsersService.isInAMatchMaking(user.id);
      client.emit('inMatchMaking', resp);
    } catch (error) {
      console.log(error);
    }
  }
  @SubscribeMessage('down')
  onDown(client: Socket, payload: boolean) {
    this.pongService.setKeyValue(false, client.id, payload);
  }
  @SubscribeMessage('up')
  onUp(client: Socket, payload: boolean) {
    this.pongService.setKeyValue(true, client.id, payload);
  }

  @SubscribeMessage('space')
  onSpace(client: Socket, payload: boolean) {
    this.pongService.setSpace(client.id, payload);
  }

  @SubscribeMessage('ready')
  async readyForGame(client: Socket, payload: number) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      const infos = this.pongService.playersSetReady(payload, user.id, client);
      client.join(infos.GameId.toString() + '-Game');
      const waitForReady = setInterval(async () => {
        if (this.pongService.playersReadyCheck(payload)) {
          clearInterval(waitForReady);
          if (infos.Player === 1) {
            const ret = await this.gameService.createGame(
              this.pongService.getPlayers(infos.GameId),
              GameMode.NORMAL,
            );
            this.pongService.setDatabaseId(infos.GameId, ret.id);
            this.server
              .to(infos.GameId.toString() + '-Game')
              .emit('startPong', this.pongService.sendPlayersInfos(payload));
            this.startGame(infos.GameId);
          }
          // TODO compteur pour relancer le matchmaking (15 sec) si pas de reponse
        }
        if (this.pongService.playersDisconnectCheck(infos.GameId)) {
          clearInterval(waitForReady);
          client.leave(infos.GameId.toString() + '-Game');
          client.emit(`alert`, {
            alert: {
              type: `warning`,
              message:
                'your opponent is running away, you must go back to matchmaking',
            },
          });
        }
      }, 100);
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  // loop from https://timetocode.tumblr.com/post/71512510386/an-accurate-node-js-game-loop-inbetween-settimeout-and
  startGame(gameId: number) {
    const refreshTime: number = 1000 / FRAMERATE;
    let lastRefresh = Date.now();
    this.pongService.setGameRunning(gameId, true);
    const roomName = gameId.toString() + '-Game';
    if (gameId >= 0) {
      const GameLoop = () => {
        const now = Date.now();
        if (lastRefresh + refreshTime <= now) {
          lastRefresh = now;
          this.pongService.UpdateGame(gameId);
          this.server
            .to(roomName)
            .volatile.emit('infos', this.pongService.gameInfos(gameId));
        }
        if (this.pongService.goal(gameId)) {
          this.server
            .to(roomName)
            .emit('sendScore', this.pongService.sendScore(gameId));

          if (this.pongService.isEndGame(gameId)) {
            this.pongService.setGameRunning(gameId, false);
          } else {
            this.pongService.setGoal(gameId, false);
          }
        }
        if (!this.pongService.isGameRunning(gameId)) {
          console.log(`Game ${gameId} stopped`);
          this.server
            .to(roomName)
            .emit('GameFinals', this.pongService.sendFinalModal(gameId));
          this.gameService.insertGameResult(
            this.pongService.getDatabaseId(gameId),
            this.pongService.getResults(gameId),
          );
          this.pongService.deleteGame(gameId);
          return;
        }
        if (Date.now() - lastRefresh < refreshTime - 16) {
          setTimeout(GameLoop);
        } else {
          setImmediate(GameLoop);
        }
      };
      GameLoop();
    }
  }

  /*
██████   ██████  ███    ██ ██    ██ ███████ 
██   ██ ██    ██ ████   ██ ██    ██ ██      
██████  ██    ██ ██ ██  ██ ██    ██ ███████ 
██   ██ ██    ██ ██  ██ ██ ██    ██      ██ 
██████   ██████  ██   ████  ██████  ███████ 
  */

  @SubscribeMessage('BonusmatchmakingON')
  async enterMatchMakingRoomBonus(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);

      console.log(`${user.id} ${user.nickname} joined Bonus Match Making.`);
      this.server.to(user.id.toString()).emit('inMatchMaking', true);
      this.pongUsersService.addNewPlayerBonus(user.id);
      await sleep(2000);
      const userArray = await this.pongUsersService.makeMatchMakingBonus();
      if (userArray) {
        console.log(userArray);
        const GameId = this.pongUsersService.createGameId();
        this.pongService.createNewMatch(
          GameId,
          userArray,
          this.userService,
          true,
        );
        userArray.forEach((e) => {
          this.server.to(e.toString()).emit('inMatchMaking', false);
          this.server.to(e.toString()).emit('inGameBonus', GameId);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('readyBonus')
  async readyForGameBonus(client: Socket, payload: number) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      const infos = this.pongService.playersSetReady(payload, user.id, client);
      client.join(infos.GameId.toString() + '-Game');
      const waitForReady = setInterval(async () => {
        if (this.pongService.playersReadyCheck(payload)) {
          clearInterval(waitForReady);
          if (infos.Player === 1) {
            const ret = await this.gameService.createGame(
              this.pongService.getPlayers(infos.GameId),
              GameMode.BONUS,
            );
            this.pongService.setDatabaseId(infos.GameId, ret.id);
            this.server
              .to(infos.GameId.toString() + '-Game')
              .emit(
                'startPongBonus',
                this.pongService.sendPlayersInfos(payload),
              );
            this.startGameBonus(infos.GameId);
          }
        }
        if (this.pongService.playersDisconnectCheck(infos.GameId)) {
          clearInterval(waitForReady);

          client.leave(infos.GameId.toString() + '-Game');
          client.emit(`alert`, {
            alert: {
              type: `warning`,
              message:
                'your opponent is running away, you must go back to matchmaking',
            },
          });
        }
      }, 100);
    } catch (error) {
      client.emit(`alert`, { alert: { type: `danger`, message: error.error } });
    }
  }

  // loop from https://timetocode.tumblr.com/post/71512510386/an-accurate-node-js-game-loop-inbetween-settimeout-and
  startGameBonus(gameId: number) {
    const refreshTime: number = 1000 / FRAMERATE;
    let lastRefresh = Date.now();
    this.pongService.setGameRunning(gameId, true);
    const roomName = gameId.toString() + '-Game';
    if (gameId >= 0) {
      this.server.to(roomName).emit('sendScore', { scoreL: 0, scoreR: 0 });
      const GameLoop = () => {
        const now = Date.now();
        if (lastRefresh + refreshTime <= now) {
          lastRefresh = now;
          this.pongService.UpdateGameBonus(gameId);
          this.server
            .to(roomName)
            .volatile.emit('infos', this.pongService.gameInfos(gameId));
        }
        this.checkBonusToEmit(gameId, roomName);
        if (this.pongService.goal(gameId)) {
          this.server
            .to(roomName)
            .emit('sendScore', this.pongService.sendScore(gameId));
          if (this.pongService.isEndGame(gameId)) {
            this.pongService.setGameRunning(gameId, false);
          } else {
            this.pongService.setGoal(gameId, false);
          }
        }
        if (!this.pongService.isGameRunning(gameId)) {
          console.log(`Game ${gameId} stopped`);
          this.server
            .to(roomName)
            .emit('GameFinals', this.pongService.sendFinalModal(gameId));
          this.gameService.insertGameResult(
            this.pongService.getDatabaseId(gameId),
            this.pongService.getResults(gameId),
          );
          this.pongService.deleteGame(gameId);
          return;
        }
        if (Date.now() - lastRefresh < refreshTime - 16) {
          setTimeout(GameLoop);
        } else {
          setImmediate(GameLoop);
        }
      };
      GameLoop();
    }
  }

  checkBonusToEmit(gameId: number, roomName: string) {
    const leftCkeck = this.pongService.isBonusUPL(gameId);
    const rightCheck = this.pongService.isBonusUPR(gameId);

    if (leftCkeck === 1 || rightCheck === 1) {
      this.server
        .to(roomName)
        .volatile.emit('bonusY', this.pongService.gameInfosBonusY(gameId));
    }
    if (leftCkeck === 2 || rightCheck === 2) {
      this.server
        .to(roomName)
        .emit('bonusY', this.pongService.gameInfosBonusY(gameId));
      this.server
        .to(roomName)
        .emit('bonusType', this.pongService.gameInfosBonusType(gameId));
    }
    if (leftCkeck === 3 || rightCheck === 3) {
      this.server
        .to(roomName)
        .emit('bonusLaunch', this.pongService.gameInfosBonusLaunch(gameId));
    }
    if (leftCkeck === 4 || rightCheck === 4) {
      this.server
        .to(roomName)
        .emit('bonusBH', this.pongService.gameInfosBonusBH(gameId));
    }
  }
}

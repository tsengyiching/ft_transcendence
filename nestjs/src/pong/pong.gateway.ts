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
// https://www.generacodice.com/en/articolo/713202/how-can-i-find-the-response-time-latency-of-a-client-in-nodejs-with-sockets-socket-

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: 'http://localhost:3000/*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class PongGateway {
  constructor(
    private pongService: PongService,
    private authService: AuthService,
    private userService: UserService,
    private pongUsersService: PongUsersService,
  ) {}
  @WebSocketServer() server: Socket;

  async handleConnection(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      client.join(user.id.toString());
      this.pongUsersService.userConnect(user.id);
      const resp = this.pongUsersService.isInMatchmaking(user.id);
      client.emit('inMatchMaking', resp);
    } catch (error) {
      console.log(error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      client.leave(user.id.toString());
      const currentGame = this.pongService.userDiconnectFromGame(user.id);
      if (currentGame) client.leave(currentGame.toString() + '-Game');
      await sleep(2000);
      const left = this.pongUsersService.userDisconnect(user.id);
      if (this.pongUsersService.isInMatchmaking(user.id) && !left) {
        this.pongUsersService.removePlayer(user.id);
      }
    } catch (error) {
      console.log(error);
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

      console.log('New Player Joins', user.id.toString());
      //client.emit('inMatchMaking', true);
      this.server.to(user.id.toString()).emit('inMatchMaking', true);
      this.pongUsersService.addNewPlayer(user.id);
      await sleep(5000);
      const userArray = this.pongUsersService.makeMatchMaking();
      if (userArray) {
        console.log(userArray);
        const GameId = this.pongUsersService.createGameId(); // TODO mettre dans DB ??
        userArray.forEach((e) => {
          this.server.to(e.toString()).emit('inMatchMaking', false);
          this.pongService.createNewMatch(GameId, userArray, this.userService);
          this.server.to(e.toString()).emit('inGame', GameId);
          // TODO envoyer a la database les id des joueurs en jeu (quand ils ont accepté de commencer la partie)
        });
      }
      ////////////////////////////////////////////////// TODO
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('matchmakingOFF')
  async leaveMatchMakingRoom(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);

      console.log('New Player LEAVE', user.id.toString());
      //client.emit('inMatchMaking', false);
      this.server.to(user.id.toString()).emit('inMatchMaking', false);
      this.pongUsersService.removePlayer(user.id);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('isInMatchmaking?')
  async isInMatchmaking(client: Socket) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      const resp = this.pongUsersService.isInMatchmaking(user.id);
      console.log('isINMATCH', resp);
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

  // @SubscribeMessage('sub')
  // subscribe(client: Socket, payload: number) {
  //   console.log(client.id, payload);
  //   if (
  //     users
  //       .map((e) => {
  //         return e.paddle;
  //       })
  //       .indexOf(payload) >= 0
  //   )
  //     return;
  //   const index = users
  //     .map((e) => {
  //       return e.name;
  //     })
  //     .indexOf(client.id);
  //   if (users[index].paddle != 0) return;
  //   users[index].paddle = payload;
  //   const other = payload === 1 ? 2 : 1;

  //   if (
  //     users
  //       .map((e) => {
  //         return e.paddle;
  //       })
  //       .indexOf(other) >= 0
  //   ) {
  //     playing = true;
  //     this.server.emit('go', '');
  //   }
  //   console.log(playing);
  // }

  @SubscribeMessage('newGame')
  async gameOn(client: any) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('ready')
  async readyForGame(client: Socket, payload: number) {
    try {
      const user: User = await this.authService.getUserFromSocket(client);
      const infos = this.pongService.playersSetReady(payload, user.id, client);
      client.join(infos.GameId.toString() + '-Game');
      const waitForReady = setInterval(() => {
        if (this.pongService.playersReadyCheck(payload)) {
          clearInterval(waitForReady);
          if (infos.Player === 1) {
            console.log('matchINTHE GO');
            this.server
              .to(infos.GameId.toString() + '-Game')
              .emit('startPong', this.pongService.sendPlayersInfos(payload));
            this.startGame(infos.GameId);
          }
          // TODO compteur pour relancer le matchmaking (15 sec) si pas de reponse
        }
      }, 100);
    } catch (error) {
      console.log(error);
    }
  }
  // TODO https://gamedev.stackexchange.com/questions/57901/how-to-implement-the-server-side-game-loop/105804
  //
  startGame(gameId: number) {
    this.pongService.setGameRunning(gameId, true);
    const roomName = gameId.toString() + '-Game';
    if (gameId >= 0) {
      const IntervalID = setInterval(() => {
        this.pongService.UpdateGame(gameId);
        this.server
          .to(roomName)
          .volatile.emit('infos', this.pongService.gameInfos(gameId));
        if (!this.pongService.isGameRunning(gameId)) {
          console.log(`Game ${gameId} stopped`);
          clearInterval(IntervalID);
        }
      }, 1000 / FRAMERATE);
    }
  }
}

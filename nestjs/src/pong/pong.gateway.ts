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
	  await sleep(10000);// attendre 10 sec pour lancer le matchmaking // return un tableau d'id des 2 users qui entrent dans la game et envoie un socket a ces 2 id 
	  console.log('HOHOHO');
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
      console.log(resp);
      client.emit('inMatchMaking', resp);
    } catch (error) {
      console.log(error);
    }
  }
  // @SubscribeMessage('down')
  // onDown(client: any, payload: any) {
  //   users.map((e) => {
  //     if (e.name === client.id) e.down = payload;
  //   });
  // }
  // @SubscribeMessage('up')
  // onUp(client: any, payload: any) {
  //   users.map((e) => {
  //     if (e.name === client.id) e.up = payload;
  //   });
  // }

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
  // @SubscribeMessage('gameon')
  // gameOn(client: any, payload: any) {
  //   if (playing) {
  //     console.log('JEU');
  //     party = setNewParty();
  //     this.server.emit('gameOk', true);
  //   } else if (!playing) this.server.emit('gameOk', false);
  //   else;
  // }

  // @SubscribeMessage('start')
  // startGame(client: Socket, Payload: any) {
  //   const IntervalID = setInterval(() => {
  //     party = UpdateGame(users, party);
  //     client.volatile.emit('infos', gameInfos(party));
  //     if (playing === false) {
  //       clearInterval(IntervalID);
  //     }
  //   }, 1000 / FRAMERATE);
  // }
}

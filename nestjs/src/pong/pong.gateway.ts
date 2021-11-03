import { SubscribeMessage, WebSocketGateway , WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { gameInfos, Party, Player, setNewParty, UpdateGame, FRAMERATE } from './calc';
import { PongService } from './pong.game.service';
// https://www.generacodice.com/en/articolo/713202/how-can-i-find-the-response-time-latency-of-a-client-in-nodejs-with-sockets-socket-io
let users:Player[] = [];
let party:Party = setNewParty();
let playing:boolean = false;


@WebSocketGateway({
  namespace: 'pong', 
  cors: {
    origin: 'http://localhost:3000/*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class PongGateway {
  constructor( private pongService:PongService) {}
  @WebSocketServer() server: any;
  
  handleConnection(client: Socket, ...args: any[]) {
    if (client.id) {
      let newPlayer:Player = {
        name: client.id,
        id: users.length,
        avatar: '',
        paddle : 0,
        score : 0,
        up : false,
        down: false,
      }
      users.push(newPlayer)
    }
    console.log(`User connected ${client.id}, ${users.length} connected`);
     this.server.emit('message', `[${users.map(e => {return e.name}).join('] [')}]`);
  }
  
  handleDisconnect(client: Socket) {
    const index = users.map((e) => { return e.name}).indexOf(client.id);
    if (users[index].paddle !== 0)
      playing = false;
    if ( index > -1) { users.splice(index, 1); };
    console.log(`User disconnected ${client.id}`);
    this.server.emit('message', `[${users.join('] [')}]`);

  }
  @SubscribeMessage('down')
  onDown(client:any, payload:any) {
    users.map(e => {if (e.name === client.id ) e.down = payload; });
  }
  @SubscribeMessage('up')
  onUp(client:any, payload:any) {
    users.map(e => {if (e.name === client.id) e.up = payload;});
  }

  @SubscribeMessage('sub')
  subscribe(client:Socket, payload:number) {
    console.log(client.id, payload)
    if (users.map((e) => { return e.paddle}).indexOf(payload) >= 0)
      return ;
    const index = users.map((e) => { return e.name}).indexOf(client.id);
    if (users[index].paddle != 0)
      return ;
    users[index].paddle = payload;
    const other = payload === 1 ? 2 : 1;

    if (users.map((e) => { return e.paddle}).indexOf(other) >= 0) {
      playing = true;
      this.server.emit('go', '')
    }
    console.log(playing);
  }
  @SubscribeMessage('gameon')
  gameOn(client:any, payload:any) {
    if (playing)
    {
      console.log("JEU");
      party = setNewParty();
      this.server.emit('gameOk', true)
    }
    else if (!playing)
      this.server.emit('gameOk', false);
    else ;
  }

  @SubscribeMessage('start')
  startGame(client: Socket, Payload:any) {
    const IntervalID = setInterval(() => {
        party = UpdateGame(users, party);
        client.volatile.emit('infos', gameInfos(party));
        if (playing === false)
        {
          clearInterval(IntervalID);
        }
      }, 1000/FRAMERATE);

  }
}

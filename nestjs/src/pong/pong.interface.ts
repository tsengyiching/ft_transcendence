export type ObjectToCollide = {
  tl: Pos;
  tr: Pos;
  bl: Pos;
  br: Pos;
};

export type Pos = {
  x: number;
  y: number;
};

export type Paddle = {
  h: number;
  w: number;
  pos: Pos;
  speed: number;
};

export type Ball = {
  pos: Pos;
  radius: number;
  vx: number;
  vy: number;
  speed: number;
  acceleration: number;
};

export type Player = {
  name: string;
  id: number;
  socketId: string;
  avatar: string;
  paddle: number;
  score: number;
  up: boolean;
  down: boolean;
  ready:boolean;
};

export type Match = {
  id: number;
  ball: Ball;
  paddleL: Paddle;
  paddleR: Paddle;
  scoreL: number;
  scoreR: number;
  lasty: boolean;
  lastp: boolean;
  pOne: Player;
  pTwo: Player;
  run: boolean;
  // viewer id ??
};

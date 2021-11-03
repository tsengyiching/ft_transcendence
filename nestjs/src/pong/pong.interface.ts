export type ObjectToCollide =  {
	tl: Pos;
	tr: Pos;
	bl: Pos;
	br: Pos;
}

type Pos = {
	x: number;
	y: number;
}


export type Paddle = {
    h: number;
	w: number;
	pos: Pos;
	speed: number;
}

export type Ball = {
    pos: Pos;
	radius: number;
	vx: number;
	vy: number;
	speed:number;
    acceleration: number;
}

export type Player = {
    name: string;
    id: number;
    avatar: string;
    paddle: number;
    score: number;
    up: boolean;
    down: boolean;
}

export type Party = {
    ball:Ball;
    paddleL:Paddle;
    paddleR:Paddle;
    scoreL: number;
    scoreR: number;
    lasty: Boolean;
    lastp:boolean;
    pOne:Player;
    pTwo:Player;
    // viewer id ??
}
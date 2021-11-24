import { type } from 'os'
import { FunctionTypeNode } from 'typescript'
import create from 'zustand'
import {Paddle, Ball, Pos} from './../types/ObjectTypes'

type Player = {
	avatar:string;
	name: string;
}
type Box = {
	x:number;
	y:number;
	w:number;
	h:number;
}

type Score = {
	h: number;
	w: number;
	imgLeft:Box;
	nameLeft:Box;
	bonusLeft: Box;
	score: Box;
	imgRight:Box;
	nameRight:Box;
	bonusRight: Box;
	fontSize: number;
}

type Bonus = {
	up: boolean;
	x: number;
	y: number;
	id: number;
}

type Infos = {
	pOneY: number;
	pTwoY: number;
	ballX: number;
	ballY: number;
	scoreL: number;
	scoreR: number;
}

type Store = {
	setNewPos: (infos:Infos) => void;
	paddleL: Paddle;
	paddleR: Paddle;
	ball: Ball;
	w: number;
	h: number;
	scoreBar: Score;
	BonusLeft: Bonus;
	radius: number; // ?
	setScore: (L:number, R:number) => void;
	right:number;
	left:number;
	gameStatus:number;
	setGameStatus: (status:number) => void;
	playerL:Player;
	playerR:Player;
}

const useStore = create<Store>((set) => {
	return {
// set default values
	// paddle left
		paddleL: {
			h:0,
			w: 0,
			pos: {
				x: 10,
				y: 0
			},
		},
	//  paddle right
		paddleR: {
			h:0,
			w: 0,
			pos: {
				x: 0,
				y: 0
			},
		},
	//	ball
		ball:{
			pos: {
				x: 0,
				y: 0
			},
			radius: 0,
		},
	setNewPos: (infos:Infos) => set((state:Store) => ({ ////////// FAIRE RATIO POUR 
		ball:{...state.ball, pos:{x:infos.ballX, y:infos.ballY}},
		paddleR:{...state.paddleR, pos:{x:state.paddleR.pos.x, y:infos.pTwoY}},
		paddleL:{...state.paddleL, pos:{x:state.paddleL.pos.x, y:infos.pOneY}}
	})),
	//	general settings
		w: 0,
		h: 0,
	// Score canvas settings
		scoreBar: {
			w: 0,
			h: 0,
			imgLeft:{x:0, y:0, w:0, h:0},
			nameLeft:{x:0, y:0, w:0, h:0},
			bonusLeft: {x:0, y:0, w:0, h:0},
			score: {x:0, y:0, w:0, h:0},
			imgRight:{x:0, y:0, w:0, h:0},
			nameRight:{x:0, y:0, w:0, h:0},
			bonusRight: {x:0, y:0, w:0, h:0},
			fontSize: 48
		},
		BonusLeft: {
			up : false,
			x: 0,
			y: 0,
			id: 0,
		},
		radius:2,
		setScore: (L, R) => set(() => ({ left:L, right:R})),
		left:0,
		right:0,
		gameStatus:0,
		setGameStatus: (status) => set((s:Store) => ({gameStatus:status})),
		playerL :{ name: '', avatar: ''},
		playerR :{ name: '', avatar: ''},
	}
});

export default useStore;
export type { Ball, Paddle, Score, Bonus, Player };
import  {useRef, useEffect, useState} from "react"
import useStore from "../hooks/useStore";


const clearStore = () => {
    useStore.setState(s => ({// set default values
	// paddle left
        ...s,
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
		bonus: false,
		BonusLeft: {
			up : false,
			x: 0,
			y: -1,
			id: 0,
		},
		BonusRight:{
			up : false,
			x: 0,
			y: -1,
			id: 0,
		},
		blackHole: undefined,
		radius:2,
		left:0,
		right:0,
		gameStatus:0,
		}))
    return null
}

export default clearStore
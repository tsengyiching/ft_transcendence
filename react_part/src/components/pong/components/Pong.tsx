import { useEffect } from "react";
import useStore from './../hooks/useStore'
import ScoreBar from './ScoreCanvas'
import GameCanvas from './GameCanvas'
import BonusHandler from "./Handlers/BonusHandler";


const Pong:React.VFC<{h:number, w:number}> = (props) => {
	const set = useStore.setState;
	const score = useStore(s => s.scoreBar);
	console.log('render');
	console.log(score.imgLeft.x)

	useEffect(() => {
		set(s => ({...s,
			paddleL: {
				...s.paddleL,
				h: props.h / 6,
				w: props.w * 0.02,
				pos:{
					...s.paddleL.pos,
					x: props.w * 0.01,
				}
			},
			// paddleR
			paddleR:{
				...s.paddleR,
				h: props.h / 6,
				w: props.w * 0.02,
				pos:{
					y: props.h - (props.h / 6),
					x: props.w * 0.97,
				}
			},
			// ball
			ball:{
				...s.ball,
				radius: 15,
			},
			s:0,
			w: props.w,
			h: props.h * 0.9,
			scoreBar:{
				h: props.h * 0.1,
				w: props.w,
				imgLeft:	{
					x:props.h *0.0125,
					y:props.h *0.0125,
					w:props.h * 0.075,
					h:props.h * 0.075 },
				nameLeft:	{
					x:props.w * 0.08,
					y:props.h *0.0125,
					w:props.w * 0.3,
					h:props.h * 0.075 },
				bonusLeft:	{
					x:props.w * 0.38,
					y:props.h *0.0125,
					w:props.h * 0.075, 
					h:props.h * 0.075 },
				score:		{
					x:props.w * 0.44,
					y:props.h *0.0125, 
					w:props.w * 0.12, 
					h:props.h * 0.075 },
				imgRight:	{
					x:props.w - (props.h * 0.0875), 
					y:props.h *0.0125, 
					w:props.h * 0.075, 
					h:props.h * 0.075 },
				nameRight:	{
					x:props.w * 0.62, 
					y:props.h *0.0125, 
					w:props.w * 0.3, 
					h:props.h * 0.075 },
				bonusRight:	{
					x:props.w * 0.56, 
					y:props.h * 0.0125, 
					w:props.h * 0.075, 
					h:props.h * 0.075 },
					BonusLeft:{
						...s.BonusLeft,
						x:props.w * 0.02	},
				fontSize: 48 * props.h / 1000, },	
			}));
		}, [props.h, props.w]);
								
return (
		<div>
			<ScoreBar />
			<GameCanvas />
			<BonusHandler />
		</div>
);}

export default Pong
import {useRef, useEffect, useState} from "react"
import useStore,{Score} from "../../hooks/useStore";
import "./../ScoreCanvas.css";

function draw(ctx:CanvasRenderingContext2D, p:Score, i:number)  {
	
	ctx.clearRect(0,0, p.w, p.h);
	
	// // bonus
	let bonus = new Image();
	bonus.src = 'https://i.ibb.co/Y82RyG5/powertest.jpg';
	// bonus.onload = function () {
	// 	ctx.drawImage(bonus,0, i * 40, 40, 40,p.bonusLeft.x, p.bonusLeft.y, p.bonusLeft.w, p.bonusLeft.h);
	// }
}


const ScoreCanvasBonusLeft:React.VFC<{}> = () => {
	const props = useStore(s => s.scoreBar);
	const [last, setLast] =useState<number>(0);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// preserve information that we need between rerender
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	//let requestId:number;
	useEffect(() => {
		const timer = setTimeout(() => {
		const canvas:(HTMLCanvasElement | null) = canvasRef.current;
		canvas!.width = props.w;
		canvas!.height = props.h;
		canvas!.style.width = props.w +'px';
		canvas!.style.height= props.h +'px';
		const ctx:(CanvasRenderingContext2D | null) = canvas!.getContext("2d");
		if (ctx) {
			contextRef.current = ctx;
		}
		draw(ctx!, props, last);
		if (last === 3) // https://www.reddit.com/r/learnjavascript/comments/5vchec/help_drawing_a_canvas_inside_another_canvas/
			setLast(0);
		else
			setLast(l => l + 1)
	}, 100)
		return () => clearTimeout(timer);
	} );
	return (
		<canvas id="score-bonus-left" ref={canvasRef} ></canvas>
	);}
export default ScoreCanvasBonusLeft
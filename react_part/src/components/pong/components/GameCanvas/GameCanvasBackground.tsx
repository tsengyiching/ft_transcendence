import {useRef, useEffect} from "react"
import useStore from "../../hooks/useStore";
import "./../GameCanvas.css"
import {Ball, Paddle} from './../../types/ObjectTypes'

interface CanvasProps {
	w: number;
	h: number;
}

function drawMiddle(ctx:CanvasRenderingContext2D, props:CanvasProps) : void {
	ctx.beginPath();
	ctx.setLineDash([10, 10]);
	let n:number = props.h % 10 / 2;
	n = n === 0 ? 5 : n;
	ctx.moveTo(props.w / 2- 1, n );
	ctx.lineTo(props.w / 2 - 1, props.h );
	ctx.stroke();
}

function drawBall(ctx:CanvasRenderingContext2D, ball:Ball) : void {
	ctx.beginPath();
	ctx.fillStyle = "#005b84";
	ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
}
function drawPaddle(ctx:CanvasRenderingContext2D, paddle:Paddle) : void  {
	ctx?.beginPath();
	ctx!.fillStyle = "#374B43";
	ctx?.rect(paddle.pos.x, paddle.pos.y, paddle.w, paddle.h);
	ctx?.fill();
	ctx?.closePath();
 }


const GameCanvasBackground:React.VFC<{}> = () => {
	const h = useStore(s => s.h);
	const w = useStore(s => s.w);
	const PaddleL = useStore(s => s.paddleL);
	const PaddleR = useStore(s => s.paddleR);

	const ball = useStore(s => s.ball);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// preserve information that we need between rerender
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	let requestId:number;

	useEffect(() => {

		const canvas:(HTMLCanvasElement | null) = canvasRef.current;
		canvas!.width = w;
		canvas!.height = h;
		canvas!.style.width = w +'px';
		canvas!.style.height= h +'px';
		const ctx:(CanvasRenderingContext2D | null) = canvas!.getContext("2d");
		if (ctx) {
			contextRef.current = ctx;
		}
		const render = () => {
			ctx?.clearRect(0,0,w, h);
			drawMiddle(ctx!, {w, h});
			drawPaddle(ctx!, PaddleL);
			drawPaddle(ctx!, PaddleR);

			drawBall(ctx!, ball);
		   requestId = requestAnimationFrame(render);
		   };
		   
		   render();
		return () => { cancelAnimationFrame(requestId);}
	});
	return (
		<canvas id="background-layer" ref={canvasRef} ></canvas>
	);}

export default GameCanvasBackground
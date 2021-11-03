import {useRef, useEffect} from "react"
import useStore,{Score} from "../../hooks/useStore";
import "./../ScoreCanvas.css";

function draw(ctx:CanvasRenderingContext2D, p:Score)  {
	
	ctx.clearRect(0,0, p.w, p.h);
	// player Left
	// // avatar
	let avatarL = new Image();
	avatarL.src ='https://remeng.rosselcdn.net/sites/default/files/dpistyles_v2/ena_16_9_extra_big/2020/08/29/node_186234/12096907/public/2020/08/29/B9724421786Z.1_20200829224227_000%2BGVQGIOPDK.1-0.jpg';
	avatarL.onload = function () {ctx.drawImage(avatarL, 300, 50, 500, 500, p.imgLeft.x, p.imgLeft.y, p.imgLeft.w, p.imgLeft.h);}
	// // name
	ctx.beginPath()
	ctx.fillStyle = "#374B43"
	ctx.font = `${p.fontSize}px Roboto`;
	ctx.textAlign = 'left';
	ctx.fillText(`${'Lolololol'}`, p.nameLeft.x, p.nameLeft.y + (p.nameLeft.h * 0.75), p.nameLeft.w -p.imgLeft.x);
	ctx.closePath();
	// player Right
	// // avatar
	let avatarR = new Image();
	avatarR.src ='https://st3.depositphotos.com/11419852/14045/i/600/depositphotos_140454538-stock-photo-emperor-tamarin-monkey.jpg';
	avatarR.onload = function () {ctx.drawImage(avatarR, 0, 0, 400, 400,p.imgRight.x, p.imgRight.y, p.imgRight.w, p.imgRight.h)};
	// // name
	ctx.beginPath()
	ctx.font = `${p.fontSize}px Roboto`;
	ctx.textAlign = 'right';
	ctx.fillText(`${'BeboUuU'}`, p.nameRight.x + p.nameRight.w , p.nameRight.y + (p.nameRight.h * 0.75), p.nameRight.w - p.imgLeft.x);
	ctx.closePath();
}


const ScoreCanvasPlayers:React.VFC<{}> = () => {
	const props = useStore(s => s.scoreBar);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);

	useEffect(() => {
		const canvas:(HTMLCanvasElement | null) = canvasRef.current;
		canvas!.width = props.w;
		canvas!.height = props.h;
		canvas!.style.width = props.w +'px';
		canvas!.style.height= props.h +'px';
		const ctx:(CanvasRenderingContext2D | null) = canvas!.getContext("2d");
		if (ctx) {
			contextRef.current = ctx;
		}
		draw(ctx!, props);
	});

	return (
		<canvas id="score-players" ref={canvasRef} ></canvas>
	);
}

export default ScoreCanvasPlayers
import {useRef, useEffect, useState} from "react"
import useStore, {Bonus} from "../../hooks/useStore";
import "./../GameCanvas.css"

interface CanvasProps {
	w: number;
	h: number;
}

const colorArr = ["#ff0000", '#00c6ff',"#e3161c",'#d5212a', "#c92a36",  "#ba3645", '#9b4e64', '#776a88', '#5b80a4', '#30a1cf', '#14b6eb' ];
function drawBonus(ctx:CanvasRenderingContext2D, bonus:Bonus, radius:number) : void {
	let gradient = ctx.createRadialGradient(bonus.x, bonus.y, 0, bonus.x, bonus.y, radius);
	//gradient.addColorStop(0, "rgba(224,255,255, 50)");
	gradient.addColorStop(0, "rgba(224,255,255, 0)");
	//gradient.addColorStop(0.25, "#b2ffe5");
	//gradient.addColorStop(0.50, "#d8fff2");
	gradient.addColorStop(0.75, "#E0FFFF")
	//gradient.addColorStop(0.5, "blue");
	gradient.addColorStop(1, "white");
	ctx.beginPath();
	ctx.fillStyle = gradient;//colorArr[radius/2 % 2];
	ctx.arc(bonus.x, bonus.y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
}


const GameCanvasBonus:React.VFC<{}> = () => {
	const h = useStore(s => s.h);
	const w = useStore(s => s.w);
	const radius = useStore(s => s.radius);
	const BonusLeft = useStore(s => s.BonusLeft);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// preserve information that we need between rerender
	const contextRef = useRef<CanvasRenderingContext2D | null>(null);
	let requestId:number;
	console.log(BonusLeft.x);
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
				if (BonusLeft.up)
					drawBonus(ctx!, BonusLeft, radius);
			   requestId = requestAnimationFrame(render);
			   };
			   
			   render();
			return () => {
			cancelAnimationFrame(requestId)
	   }
	});
	return (
		<canvas id="bonus-layer" ref={canvasRef} ></canvas>
	);}

export default GameCanvasBonus
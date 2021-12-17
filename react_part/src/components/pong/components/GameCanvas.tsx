import useStore from "../hooks/useStore";
import "./GameCanvas.css"
import GameCanvasBackground from "./GameCanvas/GameCanvasBackground";

const GameCanvas:React.VFC<{}> = () => {
	const h = useStore(s => s.h);
	const w = useStore(s => s.w);
	
	return (
		<div id="stage" style={{width:`${w}px`, height: `${h}px`}}>
			<GameCanvasBackground />
		</div>
	);}

export default GameCanvas
import { useEffect } from "react";
import useStore from './../hooks/useStore'
import ScoreBar from './ScoreCanvas'
import GameCanvas from './GameCanvas'
import BonusHandler from "./Handlers/BonusHandler";
import SocketEvent from "./SocketEvent";
import SocketInfos from "./SocketInfos";
import PongInfoModal from "./PongInfoModal";
import SocketInfosBonus from "./SocketInfosBonus";
const H = 800;
const W = 1000;

const Pong:React.FC<{}> = () => {
	const set = useStore.setState;
	const bonus = useStore(s => s.bonus);
	useEffect(() => {
		set(s => ({...s,
            viewH: props.h * 0.9,
            viewW: props.w,
            scoreBar: {
                ...s.scoreBar,
                h: props.h * 0.1,
                w : props.w,
            }
			}));
		}, []);

								
return (
		<div>
			<PongInfoModal />
			<SocketEvent />
            <SocketInfos />
			{bonus  ? <SocketInfosBonus /> : null}
			<ScoreBar />
			<GameCanvas />
		</div>
);}

export default Pong
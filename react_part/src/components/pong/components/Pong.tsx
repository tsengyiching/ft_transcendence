import useStore from './../hooks/useStore'
import ScoreBar from './ScoreCanvas'
import GameCanvas from './GameCanvas'
import SocketEvent from "./SocketEvent";
import SocketInfos from "./SocketInfos";
import PongInfoModal from "./PongInfoModal";
import SocketInfosBonus from "./SocketInfosBonus";
import ResizeGame from './ResizeGame';


const Pong:React.FC<{}> = () => {
	const bonus = useStore(s => s.bonus);
		
return (
		<div>
            <ResizeGame />
			<PongInfoModal />
			<SocketEvent />
            <SocketInfos />
			{bonus  ? <SocketInfosBonus /> : null}
			<ScoreBar />
			<GameCanvas />
		</div>
);}

export default Pong
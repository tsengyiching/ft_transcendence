import { useEffect , useState, useContext} from "react";
import axios from 'axios';
import io, {Socket} from 'socket.io-client';
import { GameSocketContext } from "../../../context/gameSocket";
import useStore from './../hooks/useStore'
import {Pos} from "./../types/ObjectTypes"
type Infos = {
	pOneY: number;
	pTwoY: number;
	ballX: number;
	ballY: number;
}

 const SocketInfos:React.VFC<{}> = () => {
	const socket:Socket = useContext(GameSocketContext);
	const setPosition = useStore( s => s.setNewPos);
	const scoreL = useStore(s => s.left);
	const scoreR = useStore(s => s.right);
	const setScore = useStore(s => s.setScore);
	const setBonus = useStore(s => s.setBonus);
	const [infos, setinfos] = useState<Infos>({
		pOneY: 0,
		pTwoY: 0,
		ballX: 0,
		ballY: 0,
	});


	useEffect(() => {
        socket.on('infos', (d) => {
			setinfos(d);
		})
		socket.on('sendScore', (d) => {
			setScore(d.ScoreL, d.ScoreR);
		})
		return (() => {
			socket.off('infos');
			socket.off('sendScore');
		})
	});
	setPosition(infos);
		return (null);
 }

export default SocketInfos
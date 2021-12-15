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
	scoreL:number;
	scoreR:number;
}

type InfosBonus = {
	yL: number,
	yR: number,
	typeL: number,
	typeR: number,
	//   startL: boolean,
	//   startR: boolean,
	//   blackHoles: number[],
	pOneY: number;
	pTwoY: number;
	ballX: number;
	ballY: number;
	scoreL:number;
	scoreR:number;
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
		scoreL:0,
		scoreR:0,
	});


	useEffect(() => {
        socket.on('infos', (d) => {
			setinfos(d);
		})
	});
	socket.on('infosBonus', (d) => {
		setinfos(d);
		setBonus(d.yL, d.yR, d.typeL, d.typeR);
	});
	setPosition(infos);
	if (scoreL !== infos.scoreL || scoreR !== infos.scoreR)
		setScore(infos.scoreL, infos.scoreR);
		return (null);
 }

export default SocketInfos
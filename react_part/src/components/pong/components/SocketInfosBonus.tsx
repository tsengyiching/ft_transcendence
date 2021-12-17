import { useEffect , useState, useContext} from "react";
import axios from 'axios';
import io, {Socket} from 'socket.io-client';
import { GameSocketContext } from "../../../context/gameSocket";
import useStore from './../hooks/useStore'
import {Pos} from "./../types/ObjectTypes"

type InfosBonus = {
	yL: number,
	yR: number,
	typeL: number,
	typeR: number,
	//   startL: boolean,
	//   startR: boolean,
	//   blackHoles: number[],
}
 const SocketInfosBonus:React.VFC<{}> = () => {
	const socket:Socket = useContext(GameSocketContext);
	const yL = useStore(s => s.BonusLeft.y);
	const yR = useStore(s => s.BonusRight.y);

	const setBonusY = useStore(s => s.setBonusY);
	const setBonusType = useStore(s => s.setBonusType);
	const setBonusBH = useStore(s => s.addBlackHole);

	useEffect(() => {
		socket.on('bonusY', (d) => {
			if (d.yL !== yL || d.yR !== yR )
				setBonusY(d.yL, d.yR);
		});
		socket.on('bonusType', (d) => {
			setBonusType(d.typeL, d.typeR);
		});
		socket.on('bonusLaunch', (d) => {
			setBonusType(d.startL, d.startR);
		});
		socket.on('bonusBH', (d: string) => {
			setBonusBH(d);
		});
		return (() => {
			socket.off('bonusY');
			socket.off('bonusType');
			socket.off('bonusLaunch');
			socket.off('bonusBH');
		})
	})
	return (null);
 }

export default SocketInfosBonus
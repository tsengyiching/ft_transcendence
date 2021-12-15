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
	const setBonus = useStore(s => s.setBonus);
	useEffect(() => {
		socket.on('infosBonus', (d) => {
			setBonus(d.yL, d.yR, d.typeL, d.typeR);
		});
		return (() => {
			socket.off('infosBonus')
		})
	})
	return (null);
 }

export default SocketInfosBonus
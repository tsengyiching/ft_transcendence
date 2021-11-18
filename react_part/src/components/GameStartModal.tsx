import React, {useContext, useEffect} from "react";
import { GameSocketContext } from "../context/gameSocket";
import {Modal, Button} from 'react-bootstrap';
import {Socket} from 'socket.io-client';
import useStore from './pong/hooks/useStore';

const GameStartModal:React.FC = () => {
    const socket:Socket = useContext(GameSocketContext);
	const setGameState = useStore(s => s.setGameStatus);
	const gameState = useStore(s => s.gameStatus);
	const enter = () => {
		socket.emit('ready');
		setGameState(2);
	}

	useEffect(() => {
		socket.on('inGame', (e) => { // METTRE LA OU ON PEUT FOUTRE LE WARNING SI DANS LES OPTIONS
			setGameState(1);
			socket.emit('NewGame', e);
		})
	})
	return (
	  <Modal
	  	show={gameState === 1} 
		size="lg"
		aria-labelledby="contained-modal-title-vcenter"
		centered
	  >
		<Modal.Header closeButton>
		  <Modal.Title id="contained-modal-title-vcenter">
			Enter the Game
		  </Modal.Title>
		</Modal.Header>
		<Modal.Body>
		  <h4>Your game is ready</h4>
		  <p>
			
		  </p>
		</Modal.Body>
		<Modal.Footer>
		  <Button onClick={enter}>Enter the game</Button>
		</Modal.Footer>
	  </Modal>
	);
  }

export default GameStartModal
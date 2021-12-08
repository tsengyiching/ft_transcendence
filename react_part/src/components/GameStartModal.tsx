import React, {useContext, useEffect, useState} from "react";
import { GameSocketContext } from "../context/gameSocket";
import {Modal, Button} from 'react-bootstrap';
import {Socket} from 'socket.io-client';
import useStore from './pong/hooks/useStore';
import { useHistory } from "react-router";
import { LinkContainer } from "react-router-bootstrap";

const GameStartModal:React.FC = () => {
    const socket:Socket = useContext(GameSocketContext);
	const [gameId, setGameId] =useState<number>(-1);
	const setGameState = useStore(s => s.setGameStatus);
	const gameState = useStore(s => s.gameStatus);
	const enter = () => {
		socket.emit('ready', gameId);
		setGameState(0);
	}

	useEffect(() => {
		socket.on('inGame', (e) => { //   LA OU ON PEUT FOUTRE LE WARNING SI DANS LES OPTIONS
			setGameId(e);
			setGameState(1);
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
		</Modal.Body>

		<Modal.Footer>
		  <Button onClick={enter}>Enter the game</Button>
		</Modal.Footer>
	  </Modal>
	);
  }

export default GameStartModal
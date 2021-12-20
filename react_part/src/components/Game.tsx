import React, {useEffect, useState, useContext} from 'react';
import {Button, Image, Spinner} from 'react-bootstrap'
import './Game.css'
import Container from 'react-bootstrap/Container';
import {GameSocketContext} from './../context/gameSocket';
import {Socket} from 'socket.io-client';
import useStore from './pong/hooks/useStore';
import Pong from './pong/components/Pong';

type GameInfos = {
    pLName: string;
    pLAvatar: string;
    pRName: string;
    pRAvatar: string;
}

const Game:React.FC = () => {
    const [toggleMatchMaking, setToggleMatchMaking] = useState<boolean>();
	const gameStatus = useStore(s => s.gameStatus);
	const [watch, setWatch] = useState<boolean>(false);
	const setGameStatus = useStore(s => s.setGameStatus);
    const socket:Socket = useContext(GameSocketContext);
	
    useEffect(() => {
        let isMounted = true;
		if (gameStatus === 0 ) socket.emit('isInMatchmaking?'); 
        if (gameStatus !== 2) {
        	socket.on('inMatchMaking', (e) => {
        	    if (isMounted) {
        	    	setToggleMatchMaking(e);
        	    }
        	});
			socket.on('spectateOn', (e:boolean) => {
				setWatch(e);
			})
        }

        socket.on('startPong', (e:GameInfos) => {
            if (isMounted) {
			setGameStatus(2);
            useStore.setState((s) => ({...s, playerR:{name:e.pRName, avatar:e.pRAvatar}, playerL:{name:e.pLName, avatar:e.pLAvatar} }));
            }
        } );
		socket.on('startPongBonus', (e:GameInfos) => {
            if (isMounted) {
			setGameStatus(2);
            useStore.setState((s) => ({...s, bonus:true, playerR:{name:e.pRName, avatar:e.pRAvatar}, playerL:{name:e.pLName, avatar:e.pLAvatar} }));
            }
        } );
        return (() => {
			socket.off('spectate');
            socket.off('startPong');
            socket.off('inMatchMaking');
			socket.off('startPongBonus');
            isMounted = false;
        })
    }, [gameStatus, socket, setGameStatus])
    
    const handleClickON = () => socket.emit('matchmakingON');
    const handleClickOFF = () => socket.emit('matchmakingOFF');
	const handleClickONBonus = () => socket.emit('BonusmatchmakingON');

    function showButtons():JSX.Element {
        return (
        <div className="row align-self-center">
            <div className="col">
                    <Button variant="outline-warning" onClick={handleClickON}>Join a normal game</Button>
                </div>
                <div className="col">
                    <Button variant="outline-warning" onClick={handleClickONBonus}>Join a bonus game</Button>
                </div>
				<Image src={process.env.PUBLIC_URL + '/pongbackground.jpg'} style={{width:'100%', height:'1000px', objectFit:'cover', objectPosition:'center',}}fluid />
        </div>
        );
    }

    function waitingForGame():JSX.Element {
        return (
		<Container className='no-padding' fluid >
			<Image style={{width:'100%', height:'1000px', objectFit:'cover', objectPosition:'center',}} src='https://media4.giphy.com/media/gx54W1mSpeYMg/giphy.gif'/>
            <Button variant="outline-warning" className='button' onClick={handleClickOFF}>Exit the Matchmaking</Button>
			<div className='over'>waiting for a game <Spinner animation="border" variant="light" /></div> 
		</Container>
		);
    }

	return (
        <Container className='no-padding' fluid>
			{gameStatus === 2 || watch ? <Pong /> : toggleMatchMaking ? waitingForGame() : showButtons()}
		</Container>
	);
}
// https://culturezvous.com/wp-content/uploads/2018/09/ping-pong-the-animation-109667.jpg
// https://media4.giphy.com/media/gx54W1mSpeYMg/giphy.gif
// https://thumbs.dreamstime.com/z/one-continuous-line-drawing-young-sporty-woman-table-tennis-player-practicing-her-smash-hit-competitive-sport-concept-single-201088082.jpg
// https://images.takeshape.io/fd194db7-7b25-4b5a-8cc7-da7f31fab475/dev/c235b62a-9442-4325-b9c9-ec1b7bfcb8f2/xdVFewf.gif?w=1200&q=80 popup defi
export default Game;

// TODO POSTICO
import React, {useState} from 'react';
import {Button, Image, Spinner} from 'react-bootstrap'
import './Game.css'
import Container from 'react-bootstrap/Container';
import {GameSocketContext, gameSocket} from './../context/gameSocket';

const Game:React.FC = () => {
    const [toggleGame, setToggleGame] = useState<boolean>(false);
    
    const handleClick = () => setToggleGame(!toggleGame);
    
    function showButtons():JSX.Element {
        return (
        <div className="row align-self-center">
            <div className="col">
                    <Button variant="outline-warning" onClick={handleClick}>Join a normal game</Button>
                </div>
                <div className="col">
                    <Button variant="outline-warning">Join a bonus game</Button>
                </div>
				<Image src={process.env.PUBLIC_URL + '/pongbackground.jpg'} style={{width:'100%', height:'1000px', objectFit:'cover', objectPosition:'center',}}fluid />
        </div>
        );
    }

    function waitingForGame():JSX.Element {
        return (
		<Container className='no-padding' fluid >
			<Image style={{width:'100%', height:'1000px', objectFit:'cover', objectPosition:'center',}} src='https://media4.giphy.com/media/gx54W1mSpeYMg/giphy.gif'/>
            <Button variant="outline-warning" className='button' onClick={handleClick}>Exit the Matchmaking</Button>
			<p className='over'>waiting for a game </p> <Spinner className='overspinner' animation="border" variant="light" />
		</Container>
		);
    }
	return (
		<GameSocketContext.Provider value={gameSocket}>
        <Container className='no-padding' fluid>
            {toggleGame ? waitingForGame() : showButtons()}
		</Container>
		</GameSocketContext.Provider>
	);
}
//  https://culturezvous.com/wp-content/uploads/2018/09/ping-pong-the-animation-109667.jpg
// https://media4.giphy.com/media/gx54W1mSpeYMg/giphy.gif
// https://thumbs.dreamstime.com/z/one-continuous-line-drawing-young-sporty-woman-table-tennis-player-practicing-her-smash-hit-competitive-sport-concept-single-201088082.jpg
// https://images.takeshape.io/fd194db7-7b25-4b5a-8cc7-da7f31fab475/dev/c235b62a-9442-4325-b9c9-ec1b7bfcb8f2/xdVFewf.gif?w=1200&q=80 popup defi
export default Game;


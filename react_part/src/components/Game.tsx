import React, {useState} from 'react';
import {Button, Image} from 'react-bootstrap'
import './Game.css'
import Container from 'react-bootstrap/Container';

const Game:React.FC = () => {
    const [toggleGame, setToggleGame] = useState<boolean>(false);
    
    const handleClick = () => setToggleGame(!toggleGame);
    
    function showButtons():JSX.Element {
        return (
        <div className="row align-self-center">
            <div className="col">
                    <Button onClick={handleClick}>Join a normal game</Button>
                </div>
                <div className="col">
                    <Button>Join a bonus game</Button>
                </div>
        </div>
        );
    }

    function waitingForGame():JSX.Element {
        return (
		<Container className='container-content' fluid >
			<Image src='https://media4.giphy.com/media/gx54W1mSpeYMg/giphy.gif' fluid/>
            <Button className='button' onClick={handleClick}>Exit the Matchmaking</Button>
			
            <p className='over'>waiting for a game ...</p>
		</Container>
		);
    }
   //         {/*<div className='waiting-text'>looking for a partner...</div>*/}

	return (
        <Container className='container-back' fluid>
            {toggleGame ? waitingForGame() : showButtons()}
            {toggleGame ? '' : <Image src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4zqAcI7RlbhpEpf_gqQpC3krnJeYXifFIwg&usqp=CAU' fluid />}
		</Container>
	);
}
//  https://culturezvous.com/wp-content/uploads/2018/09/ping-pong-the-animation-109667.jpg
// https://media4.giphy.com/media/gx54W1mSpeYMg/giphy.gif
// https://thumbs.dreamstime.com/z/one-continuous-line-drawing-young-sporty-woman-table-tennis-player-practicing-her-smash-hit-competitive-sport-concept-single-201088082.jpg
// https://images.takeshape.io/fd194db7-7b25-4b5a-8cc7-da7f31fab475/dev/c235b62a-9442-4325-b9c9-ec1b7bfcb8f2/xdVFewf.gif?w=1200&q=80 popup defi
export default Game;


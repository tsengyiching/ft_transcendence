import {Button} from 'react-bootstrap'

function Game() {
	return (
        <div className="row align-self-center">
            <div className="col"></div>
             <div className="col">
                <Button>Create / Join Game</Button>
            </div>
            <div className="col">
                <Button>Create / Join Bonus Game</Button>
            </div>
            <div className="col"></div>
		</div>
	)
}

export default Game;
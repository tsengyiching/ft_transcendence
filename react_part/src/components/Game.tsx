import {Col, Button} from 'react-bootstrap'

function Game() {
	return (
        <div className="row align-self-center">
            <div className="col"></div>
             <div className="col">
                <Button>Créer / Rejoindre une partie</Button>
            </div>
            <div className="col">
                <Button>Créer / Rejoindre une partie bonus</Button>
            </div>
            <div className="col"></div>
		</div>
	)
}

export default Game;
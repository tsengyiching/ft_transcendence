import {Col, Button} from 'react-bootstrap'

function Game() {
	return (
    <Col xs={7} style={{border:'1px solid black'}}>
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
	</Col>
	)
}

export default Game;
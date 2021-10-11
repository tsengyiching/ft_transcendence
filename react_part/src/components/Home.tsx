import { Row, Col } from 'react-bootstrap'
import {SocketContext} from "../context/socket"
import { useContext } from 'react'
import Chat from './chat/Chat'
import Game from './Game'
import Friends from './Friends'

function Accueil() {

    let socket = useContext(SocketContext);

    return (
        <div>
            <h2>Accueil</h2>
                <Row>
					<Game />
                    <Col style={{border:'1px solid black'}}>
						<Friends />
						<Chat socket={socket}/>
					</Col>
                </Row>
        </div>
    )
}

export default Accueil;
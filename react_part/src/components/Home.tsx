import { Form, Button, Row, Col } from 'react-bootstrap'
import {useState, useEffect} from 'react'
import {socket} from "./service/socket"
import Chat from './chat/Chat'
import Game from './Game'
import Friends from './Friends'

function Accueil() {
   
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
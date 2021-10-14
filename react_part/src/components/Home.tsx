import { Row, Col } from 'react-bootstrap'
import {SocketContext} from "../context/socket"
import { useContext } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import axios from 'axios'

import Talk from './Talk';
import Chat from './chat/Chat'
import Game from './Game'
import Friends from './Friends'

function Accueil() {

    let socket = useContext(SocketContext);

function Accueil() {
    const [id, setId] = useState(0);
    const [name, setName] = useState("");

    useEffect(() => {

        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => {
            setId(res.data.id)
            setName(res.data.nickname)
        })
    })
    return (
        <div>
            <h2>Home</h2>
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
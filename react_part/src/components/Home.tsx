import { useEffect, useState } from 'react'
import axios from 'axios'
import { Row, Col } from 'react-bootstrap'
import {SocketContext} from "../context/socket"
import { useContext } from 'react'
import Chat from './chat/Chat'
import Members from './members/members';
import Game from './Game'
import "./Home.css"
import "./members/members.css"

function Home() {

    let socket = useContext(SocketContext);
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
                <Row>
                    <Col lg={7} md={6} xs={5} className="LeftColHome">
				    	<Game />
                    </Col>
                    <Col lg={5} md={4} sm={3} className="RightColHome">
		                <Row lg={5} md={5} className="ColMembers" as={Members} />
                        <Row lg={2} md={2} as={Chat}/>
					</Col>
                </Row>
    )
}

export default Home;
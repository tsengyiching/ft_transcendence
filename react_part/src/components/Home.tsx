import { useEffect, useState } from 'react'
import axios from 'axios'
import { Row, Col } from 'react-bootstrap'
import {SocketContext} from "../context/socket"
import { useContext } from 'react'
import InterfaceUser from './chat/InterfaceUser'
import Game from './Game'
import "./Home.css"
import "./members/members.css"
import Notifications from './Notifications'


function Home() {

    const [id, setId] = useState(0);
    const [name, setName] = useState("");

    useEffect(() => {
        let isMounted = true;
        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => { if (isMounted)
            {
            setId(res.data.id)
            setName(res.data.nickname)} })
        .catch(res => {if (isMounted) console.log(`error in Home : ${res.data}`)} )
        return (() => {isMounted = false})
    })
    return (
        <div>
                <Notifications/>
                <Row>

                    <Col lg={7} md={6} xs={5} className="LeftColHome">
				    	<Game />
                    </Col>
                    <Col lg={5} md={4} sm={3} className="RightColHome">
		                {/*<Row lg={5} md={5} className="ColMembers" as={Members} />*/}
                        <InterfaceUser/>
					</Col>
                </Row>
        </div>
    )
}

export default Home;
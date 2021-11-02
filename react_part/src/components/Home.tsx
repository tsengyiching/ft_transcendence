import { Row, Col } from 'react-bootstrap'
import InterfaceUser from './chat/InterfaceUser'
import Game from './Game'
import "./Home.css"
import "./members/members.css"
import Notifications from './Notifications'


function Home() {

    return (
        <div>
                <Notifications/>
                <Row>

                    <Col lg={7} md={6} xs={5} className="LeftColHome">
				    	<Game />
                    </Col>
                    <Col lg={5} md={4} sm={3} className="RightColHome">
                        <InterfaceUser/>
					</Col>
                </Row>
        </div>
    )
}

export default Home;
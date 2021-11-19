import { Row, Col } from 'react-bootstrap'
import InterfaceUser from './InterfaceUser'
import Game from './Game'
import "./Home.css"
import "./members/members.css"
import Notifications from './Notifications'

function Home() {

    return (
        <div>
                <Notifications/>
                <Row>
                    <Col lg={8}  className="LeftColHome">
				    	<Game />
                    </Col>
                    <Col lg={4} className="RightColHome">
                        <InterfaceUser/>
					</Col>
                </Row>
        </div>
    )
}

export default Home;
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
                    <Col lg={8} className="LeftColHome m-1 p-1">
				    	<Game />
                    </Col>
                    <Col className="RightColHome m-1">
                        <InterfaceUser/>
					</Col>
                </Row>
        </div>
    )
}

export default Home;
import { Row, Col, Container } from 'react-bootstrap'
import InterfaceUser from './chat/InterfaceUser'
import Game from './Game'
import "./Home.css"
import "./members/members.css"
import Notifications from './Notifications'


function Home() {

    return (
        <Container className='no-padding' fluid>
                <Notifications/>	
                <Row>
                    <Col lg={8}  className="LeftColHome">
				    	<Game />
                    </Col>
                    <Col lg={4} className="RightColHome">
                        <InterfaceUser/>
					</Col>
                </Row>
		</Container>
        
    )
}

export default Home;
import { Row, Col, Container } from 'react-bootstrap'
import InterfaceUser from './InterfaceUser'
import Game from './Game'
import "./Home.css"
import "./members/members.css"
import Notifications from './Notifications'

function Home() {

    return (
        <Container className='no-padding' fluid>
                <Notifications/>
				
                <Row>
                    <Col lg={7} md={6} xs={5} className="LeftColHome">
				    	<Game />
                    </Col>
                    <Col lg={5} md={4} sm={3} className="RightColHome">
                        <InterfaceUser/>
					</Col>
                </Row>
		</Container>
        
    )
}

export default Home;
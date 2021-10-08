import { Form, Button, Row, Col } from 'react-bootstrap'
import React from 'react'
import Talk from './Talk';
import { Socket } from "socket.io-client";
import CreateChannelButton from './create_channel';

function Chat(props: {socket: Socket}) {

    function CreateChannel() {

        console.log(`React : Create Channel from ${props.socket.id}`);
        props.socket.emit('message', "hello");
        props.socket.on('message', (data) => {console.log(`response from backend : ${data}`)});
    }

	return (
	<Row>
        <h4 style={{border:'1px solid black', height: "35px"}} > Chat </h4>
        <Col>
            <Col>
                <div className="col-4" style={{border:'1px solid black'}}>
                <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="/accueil">Salons</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/accueil">Messages privés</a>
                </li>
                </ul>
                </div>
            </Col>
            <Col>
              <CreateChannelButton socketid={props.socket}/>
              <Button>Create Private Conversation </Button>
            </Col>
        </Col>
        <Col>
            <div className="col" >
                <Talk />
                <div className="d-flex justify-content-center">
                    <Form className="w-75 p-3">
                        <Form.Control type="name" placeholder="Message" />
                        <Button type="submit">envoyer</Button>
                    </Form>
                </div>
            </div>

        </Col>

	</Row>
	);
}

export default Chat;
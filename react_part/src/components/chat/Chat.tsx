import { Form, Button } from 'react-bootstrap'
import React, {useState, useEffect} from 'react'
import Talk from './Talk';
import { io, Socket } from "socket.io-client";
import CreateChannelButton from './create_channel';

function Chat() {

    const [socket, setSocket] = useState(io("http://localhost:8080/chat"));

    function CreateChannel() {

        console.log(`React : Create Channel from ${socket.id}`);
        socket.emit('message', "hello");
        socket.on('message', (data) => {console.log(`response from backend : ${data}`)});
    }

	return (
	<React.Fragment>
    <div style={{border:'1px solid black'}} ><h4>Chat</h4></div>
    <div>
        <CreateChannelButton />
        <Button>Create Private Message </Button>
    </div>
     <div>
        <div className="row">
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
            <div className="col" >
                <div style={{border:'1px solid black'}}><Talk ></Talk></div>
                <div className="d-flex justify-content-center">
                    <Form className="w-75 p-3">
                        <Form.Control type="name" placeholder="Message" />
                        <Button type="submit">envoyer</Button>
                    </Form>
                </div>
            </div>
        </div>
    </div>
	</React.Fragment>
	);
}

export default Chat;
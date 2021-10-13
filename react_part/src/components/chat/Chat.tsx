import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState} from 'react'
import Talk from './Talk';
import { Socket } from "socket.io-client";
import CreateChannelButton from './create_channel';
import ListChannel from "./ListChannel";
import './Chat.css'


function Chat(props: {socket: Socket}) {

    const [radioValue, setRadioValue] = useState('1');

    const radios = [
        {name: 'Channels', value: '1'},
        {name: 'private message', value: '2'},
    ]

	return (
	<Row>
        <h4 style={{border:'1px solid black', height: "35px"}} > Chat </h4>
        <Col>
            <Row>
                <ButtonGroup className="mb-2">
                    {radios.map((radio, idx) => (
                        <ToggleButton
                        key={idx}
                        id={`radio-${idx}`}
                        type='radio'
                        variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                        name="radio"
                        value={radio.value}
                        checked={radioValue === radio.value}
                        onChange={(e) => setRadioValue(e.currentTarget.value)}
                        >
                            {radio.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
                <ListChannel />
                <CreateChannelButton socketid={props.socket}/>
                <button className="ButtonCreate bg-primary">Create Private Conversation </button>
            </Row>
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
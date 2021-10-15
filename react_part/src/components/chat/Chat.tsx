import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState} from 'react'
import Talk from './Talk';
import { Socket } from "socket.io-client";
import CreateChannelButton from './create_channel';
import ListChannel from "./ListChannel";
import ListMP from "./ListMP"
import DropdownListUser from './DropdownListUser';
import './Chat.css'


function Chat(props: {socket: Socket}) {

    const [radioValue, setRadioValue] = useState('1');
    const [channelSelected, setChannelSelected] = useState<{channel_id: number, channel_name: string} | undefined>();

    const radios = [
        {name: 'Channels', value: '1'},
        {name: 'private message', value: '2'},
    ]

	return (
	<Row>
        <Col className="ColumnSelectChannel" lg={3}>
            <Row>
                <ButtonGroup className="mb-2">
                    {radios.map((radio, idx) => (
                        <ToggleButton
                        id={`radio-${idx}`}
                        name="radio"
                        key={idx}
                        type='radio'
                        variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                        value={radio.value}
                        checked={radioValue === radio.value}
                        onChange={(e) => setRadioValue(e.currentTarget.value)}
                        >
                            {radio.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
                {radioValue==='1' ? <ListChannel channelSelected={channelSelected} setChannelSelected={setChannelSelected}/> : <ListMP/>}
                <CreateChannelButton socketid={props.socket}/>
                <button className="ButtonCreate bg-success"> Create Private Conversation </button>
            </Row>
        </Col>
        <Col className="ColumnChat">
                <Row className="TitleChannel">
                        <Col>
                            {channelSelected !== undefined
                            ? <div> {channelSelected.channel_name} </div>
                            : <div> No Channel selected </div>}
                        </Col>
                        <Col>
                            <DropdownListUser/>
                        </Col>
                </Row>
                <Talk />
                <div className="d-flex justify-content-center">
                    <Form className="w-75 p-3">
                        <Form.Control type="name" placeholder="Message" />
                        <Button type="submit">envoyer</Button>
                    </Form>
                </div>
                <Row>
                    <Button > Modo Rights </Button>
                    <Button > Owner Rights </Button>
                </Row>
        </Col>

	</Row>
	);
}

export default Chat;
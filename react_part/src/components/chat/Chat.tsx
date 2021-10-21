import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import React, {useState, useContext} from 'react'
import Talk from './Talk';
import CreateChannelButton from './create_channel';
import ListChannel from "./ListChannel";
import ListMP from "./ListMP"
import DropdownListUser from './DropdownListUser';
import './Chat.css'
import {SocketContext} from '../../context/socket'
import Members from '../members/members';

function Chat() {

    const [channelradioValue, setchannelRadioValue] = useState('1');
    const [channelSelected, setChannelSelected] = useState<{channel_id: number, channel_name: string} | undefined>();
    const socket = useContext(SocketContext);

    const channelradios = [
        {name: 'Channels', value: '1'},
        {name: 'private message', value: '2'},
    ]

    function InterfaceChannel() {
        return (
        <Row>
        <ButtonGroup className="mb-2">
            {channelradios.map((radio, idx) => (
                <ToggleButton
                id={`channelradio-${idx}`}
                name="radio"
                key={idx % 2 ? 'channels' : 'private message'}
                type='radio'
                variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                value={radio.value}
                checked={channelradioValue === radio.value}
                onChange={(e) => setchannelRadioValue(e.currentTarget.value)}
                >
                    {radio.name}
                </ToggleButton>
            ))}
        </ButtonGroup>
        
        <Col lg={10}>
            {channelradioValue==='1' ? 
            <ListChannel channelSelected={channelSelected} setChannelSelected={setChannelSelected}/> 
            : <ListMP/>}
        </Col>
        <Col>
            {channelradioValue==='1' ? 
                  <CreateChannelButton socketid={socket}/>
                : <button className="ButtonCreate bg-success"> Create Private Conversation </button>
            }
        </Col>
        </Row>
    )}

    function InterfaceChat() {
        return (
            <div>
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
            {<Talk />}
            <Form className="w-75 p-3 d-flex justify-content-center">
                <Form.Control type="name" placeholder="Message" />
                <Button type="submit">envoyer</Button>
            </Form>
            <Button > Modo Rights </Button>
            <Button > Owner Rights </Button>
            </div>
    )}

	return (
        <div>
        <Row as={InterfaceChannel}/>
        <Row>
          <Col className="ColumnChat" lg={{span: 3, offset: 0}}>
              <InterfaceChat/>
          </Col>
          <Col className="ColumnChat" lg={{span: 9, offset: 0}} >
            <Members/>
          </Col>
        </Row>
        </div>

	);
}

export default Chat;
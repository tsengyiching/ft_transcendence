import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import React, {useState, useContext, useEffect} from 'react'
import Talk from './Talk';
import CreateChannelButton from './create_channel';
import ListChannel from "./ListChannel";
import ListMP from "./ListMP"
import DropdownListUser from './DropdownListUser';
import './InterfaceUser.css'
import {SocketContext} from '../../context/socket'
import InterfaceMembers from '../members/members';
import { Server } from 'http';

interface IStatus {
    id: number,
    status: 'Available' | 'Playing' | 'Offline'
}

function InterfaceUser() {

    const [channelradioValue, setchannelRadioValue] = useState('1');
    const [channelSelected, setChannelSelected] = useState<{channel_id: number, channel_name: string} | undefined>();
    const socket = useContext(SocketContext);

    const channelradios = [
        {name: 'Channels', value: '1'},
        {name: 'private message', value: '2'},
    ]

    useEffect(() => {
        socket.on('channel-need-reload', () => {socket.emit('ask-reload-channel');});
        //return (socket.off('channel-need-reload'))
    }, [])

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
                <div>
                    <CreateChannelButton socketid={socket}/>
                    { channelSelected !== undefined &&
                    <Button onClick={() => {socket.emit("channel-leave", {channelId: channelSelected.channel_id}) }}> Leave Channel </Button>}
                </div>
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
          <Col className="ColumnChat" lg={{span: 8, offset: 0}}>
              <InterfaceChat/>
          </Col>
          <Col className="ColumnChat" lg={{span: 4, offset: 0}} >
            <InterfaceMembers />
          </Col>
        </Row>
        </div>
	);
}

export default InterfaceUser;
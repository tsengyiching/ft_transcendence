import 'bootstrap/dist/css/bootstrap.min.css'
import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState, useContext, useEffect} from 'react'
import CreateChannelButton from './create_channel';
import ListChannel from "./ListChannel";
import ListMP from "./ListMP"
import {SocketContext} from '../../context/socket'
import InterfaceMembers from '../members/members';
import LeaveChannelButton from './LeaveChannelModal'
import './InterfaceUser.css'
import InterfaceChat from './ChatInterface';

export interface IChannel {
    channel_id: number,
    channel_name: string,
}

/* * ALL THE USER INTERFACE */

function InterfaceUser() {

    const [channelradioValue, setchannelRadioValue] = useState('1');
    const [channelSelected, setChannelSelected] = useState<IChannel | undefined>();
    const socket = useContext(SocketContext);

    const channelradios = [
        {name: 'Channels', value: '1'},
        {name: 'private message', value: '2'},
    ]

    useEffect(() => {
        socket.on('channel-need-reload', () => socket.emit('ask-reload-channel'));
    }, [socket])

    function ResetChannel() { setChannelSelected(undefined)}

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
                    { channelSelected !== undefined ?
                        <LeaveChannelButton channel={channelSelected} CallBackFunction={ResetChannel} />
                    :   <Button disabled className="ButtonCreate bg-secondary"> Leave Channel</Button>}
                </div>
                : <button className="ButtonCreate bg-success"> Create Private Conversation </button>
            }
        </Col>
        </Row>
    )}

	return (
        <div>
        <Row as={InterfaceChannel}/>
        <Row>
          <Col className="ColumnChat" lg={{span: 8, offset: 0}} style={{borderRight:"1px solid #aaa", height: "48em"}}>
              <InterfaceChat channelSelected={channelSelected}/>
          </Col>
          <Col className="ColumnChat" lg={{span: 4, offset: 0}} >
            <InterfaceMembers />
          </Col>
        </Row>
        </div>
	);
}

export default InterfaceUser;

import 'bootstrap/dist/css/bootstrap.min.css'
import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState, useContext, useEffect} from 'react'
import CreateChannelButton from './create_channel';
import ListChannel from "./ListChannel";
import ListPrivateMessage from "./ListPrivateMessage"
import {SocketContext} from '../../context/socket'
import InterfaceMembers from '../members/members';
import LeaveChannelButton from './LeaveChannelModal'
import './InterfaceUser.css'
import InterfaceChat from './ChatInterface';

export type Role = 'Owner' | 'Admin' | 'User';

export interface IChannel {
    channel_id: number,
    channel_name: string,
    channel_type: 'Public' | 'Private',
    role: Role,
}

export interface IPrivateMessage {
    user_id: number,
}

export type messageType = 'Channel' | 'MP'

/* * ALL THE USER INTERFACE */

function InterfaceUser() {

    const [interfaceRadioValue, setinterfaceRadioValue] = useState<string>('Channel');
    const [channelSelected, setChannelSelected] = useState<IChannel | undefined>();
    const [PrivateMessageSelected, setPrivateMessageSelected] = useState<IPrivateMessage | undefined>();
    const socket = useContext(SocketContext);

    const channelradios = [
        {name: 'Channels', value: 'Channel'},
        {name: 'private message', value: 'MP'},
    ]

    useEffect(() => {
        socket.on('channel-need-reload', () => socket.emit('ask-reload-channel'));
    }, [socket])

    function SwitchMP(userId: number)
    {
        setinterfaceRadioValue('MP');
        setPrivateMessageSelected({user_id: userId});
    }

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
                value = {radio.value}
                checked={interfaceRadioValue === radio.value}
                onChange={(e) => setinterfaceRadioValue(e.currentTarget.value)}
                >
                    {radio.name}
                </ToggleButton>
            ))}
        </ButtonGroup>
        
        <Col lg={10}>
            {interfaceRadioValue ==='Channel' ? 
            <ListChannel channelSelected={channelSelected} setChannelSelected={setChannelSelected}/> 
            : <ListPrivateMessage />}
        </Col>
        <Col>
            {interfaceRadioValue ==='Channel' ? 
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
              <InterfaceChat channelSelected={channelSelected} privateSelected={PrivateMessageSelected}
              messageType={interfaceRadioValue === 'MP' ? 'MP' : 'Channel'}/>
          </Col>
          <Col className="ColumnChat" lg={{span: 4, offset: 0}} >
            <InterfaceMembers />
          </Col>
        </Row>
        </div>
	);
}

export default InterfaceUser;

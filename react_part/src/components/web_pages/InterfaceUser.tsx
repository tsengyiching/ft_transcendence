import 'bootstrap/dist/css/bootstrap.min.css'
import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import React, {useState, useContext, useEffect} from 'react'
import CreateChannelButton from '../chat/Channel/create_channel';
import ListChannel from "../chat/Channel/ListChannel";
import ListPrivateConversation from "../chat/PrivateConversation/ListPrivateConversation"
import {SocketContext} from '../../context/socket'
import InterfaceMembers from '../members/members';
import LeaveChannelButton from '../chat/Channel/LeaveChannelModal'
import './InterfaceUser.css'
import InterfaceChat from '../chat/ChatInterface';

export type Role = 'Owner' | 'Admin' | 'User';

export interface IChannel {
    channel_id: number,
    channel_name: string,
    channel_type: 'Public' | 'Private',
    role: Role,
}

export interface IPrivateConversation {
    conversation_id: number,
    conversation_name: string,
}

export interface IUserConversation {
    user_id: number,
}

export type messageType = 'Channel' | 'MP'

/* * ALL THE USER INTERFACE */

export const SwitchContext = React.createContext((userId: number) => {});

function InterfaceUser() {

    const [interfaceRadioValue, setinterfaceRadioValue] = useState<string>('Channel');
    const [channelSelected, setChannelSelected] = useState<IChannel | undefined>();
    const [UserConversationSelected, setUserConversationSelected] = useState<IUserConversation | undefined>();
    const socket = useContext(SocketContext);

    const channelradios = [
        {name: 'Channels', value: 'Channel'},
        {name: 'private message', value: 'MP'},
    ]

    useEffect(() => {
        socket.on('channel-need-reload', () => socket.emit('ask-reload-channel'));
    }, [socket])

    function SwitchPrivateConversation(userId: number)
    {
        setinterfaceRadioValue('MP');
        setUserConversationSelected({user_id: userId});
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
            : <ListPrivateConversation setUserConversationSelected={setUserConversationSelected}/>}
        </Col>
        <Col>
            {interfaceRadioValue ==='Channel' ?
                <div>
                    <CreateChannelButton socketid={socket}/>
                    { channelSelected !== undefined ?
                        <LeaveChannelButton channel={channelSelected} CallBackFunction={ResetChannel} />
                    :   <Button disabled className="ButtonCreate bg-secondary"> Leave Channel</Button>}
                </div>
                : <div></div>
            }
        </Col>
        </Row>
    )}

	return (
        <SwitchContext.Provider value={SwitchPrivateConversation}>
        <div>
        <Row as={InterfaceChannel}/>
        <Row>
          <Col className="ColumnChat" lg={{span: 8, offset: 0}} style={{borderRight:"1px solid #aaa", height: "48em"}}>
              <InterfaceChat channelSelected={channelSelected} privateSelected={UserConversationSelected}
              messageType={interfaceRadioValue === 'MP' ? 'MP' : 'Channel'}/>
          </Col>
          <Col className="ColumnChat" lg={{span: 4, offset: 0}} >
            <InterfaceMembers />
          </Col>
        </Row>
        </div>
        </SwitchContext.Provider>
	);
}

export default InterfaceUser;

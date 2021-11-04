import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState, useContext, useEffect} from 'react'
import ChatChannel from './Talk';
import CreateChannelButton from './Create_channel';
import ListChannel from "./ListChannel";
import ListMP from "./ListMP"
import {SocketContext} from '../../context/socket'
import InterfaceMembers from '../members/members';
import LeaveChannelButton from './LeaveChannelModal'
import './InterfaceUser.css'

interface IChannel {
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

/* 
****CHAT****
*/

interface IMessage {
    channel_id: number,
    message_channelId: number,
    message_authorId: number,
    message_content: string,
    /*message_createDate: Date,*/
    author_nickname: string,
    author_avatar: string,
}

interface IUser {
    user_id: number,
    user_nickname: string,
    channel_type: 'Public' | 'Private'
}

function Chat(channelSelected: IChannel)
{
    const socket = useContext(SocketContext);
    const [ListMessage, SetListMessage] = useState<IMessage[]>([]);
    const [ListUsers, SetListUsers] = useState<IUser[]>([]);

    useEffect(() => {
        socket.emit('channel-load', {channelId: channelSelected.channel_id});
        //socket.on('channel-message-list', )
        SetListMessage([{channel_id: channelSelected.channel_id, 
                        message_channelId: 1,
                        message_authorId: 115,
                        message_content: "coucou!",
                        author_nickname: "theo",
                        author_avatar: "https://ih1.redbubble.net/image.362317170.4069/st,small,507x507-pad,600x600,f8f8f8.jpg"}]);

        socket.on('channel-users', (data: IUser[]) => {SetListUsers(data)});
        //get list users
        socket.on('channel')

        return (() => { socket.emit('channel-unload', {channelId: channelSelected.channel_id}); socket.off('channel-users') });
    }, [])

	return (
	<Row className="TitleChannel">
		{channelSelected !== undefined
		? <h2 style={{height:"1.2em"}}> {channelSelected.channel_name} </h2>
		: <h2 style={{height:"1.2em"}}></h2>}
		<Col lg={8}>
			<ChatChannel/>
			<Form className="FormSendMessage justify-content-center" style={{padding:"0px", paddingTop:"0.8em"}}>
			<Form.Control type="name" placeholder="Message" />
			{channelSelected !== undefined ? <Button type="submit" > Send </Button>
			: <Button type="submit" disabled > Send </Button> }
			</Form>
		</Col>
		<Col style={{height:"60em"}}>
			<Button style={{width:"12.5em", borderRadius:"3em"}} variant={"secondary"}> Channel Settings </Button>
			<div style={{height:"40em"}}> list channel participants</div>
		</Col>
	</Row>)
}

function ChatDisabled()
{
	return (
	<Row className="TitleChannel">
		<h2 style={{height:"1.2em"}}></h2>
		<Col lg={8}>
			<ChatChannel/>
			<Form className="FormSendMessage justify-content-center" style={{padding:"0px", paddingTop:"0.8em"}}>
			<Form.Control type="name" placeholder="Message" />
			<Button type="submit" disabled > Send </Button> 
			</Form>
		</Col>
		<Col style={{height:"60em"}}>
			<Button style={{width:"12.5em", borderRadius:"3em"}} variant={"secondary"} disabled> Channel Settings </Button>
			<div style={{height:"40em"}}> list channel participants</div>
		</Col>
	</Row>);
}

function InterfaceChat(props: {channelSelected: IChannel | undefined}) {
    return (
    <div>
            {props.channelSelected !== undefined ?
            <Chat channel_id={props.channelSelected.channel_id} channel_name={props.channelSelected.channel_name} />
            : <ChatDisabled/> }
    </div>
)}
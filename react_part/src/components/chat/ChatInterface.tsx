import 'bootstrap/dist/css/bootstrap.min.css'
import { Form, Button, Row, Col, Image } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import {useState, useContext, useEffect, useRef} from 'react'
import {SocketContext} from '../../context/socket'
import './ChatInterface.css'
import {IChannel} from './InterfaceUser'
import {DataContext} from '../../App'
import { ContextMenuTrigger } from 'react-contextmenu'

/* 
****CHAT****
*/

interface IMessage {
    message_id: number,
    message_channelId: number,
    message_authorId: number,
    message_content: string,
    message_createDate: Date,
    author_nickname: string,
    author_avatar: string,
}

interface IUser {
    user_id: number,
    user_nickname: string,
    user_avatar: string,
    role: 'Owner' | 'Admin' | 'User'
}

function ChatDisabled()
{
	return (
	<Row className="TitleChannel">
		<h2 style={{height:"1.2em"}}></h2>
		<Col lg={8}>
			<ListChatMessage ListMessage={[]}/>
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

function ChannelMessage(message: IMessage)
{
	const userData = useContext(DataContext);
	let color = (message.message_authorId === userData.id) ? '#34b7f1' : '#25d366'
	let side;
	if (message.message_authorId === userData.id)
	{
		color = '#34b7f1';
		side = 'left';
	}
	else
	{
		color = '#25d366';
		side = 'right';
	}

	return (
	<div key={`message_${message.message_channelId}_${message.message_id}`} className={`MsgBubble`} style={{backgroundColor: color}}>
		<Row>
			<Col>
				<Image src={message.author_avatar} roundedCircle fluid className="pictureChat" />
			</Col>
			<Col>
				{message.author_nickname}
			</Col>
			<Col>
				{ message.message_createDate}
			</Col>
		</Row>
		<Row>
			<Col>
				{message.message_content}
			</Col>
		</Row>
	</div>)
}

function ListChatMessage(props: {ListMessage: IMessage[]}) {

	const messagesEndRef = useRef<null | HTMLDivElement>(null)
	
	useEffect(() => {
		//console.log("list message in ChatMessages: ");
		//console.log(props.ListMessage);
		scrollToBottom();
	}, [props.ListMessage])
	
	const scrollToBottom = () => {
		if (messagesEndRef.current !== null && messagesEndRef.current.id == 'bottomchatmessage')
	  		messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: 'end', inline: 'nearest' })
	}

    return (

        <div className="overflow-auto" style={{height: '38em', border:'1px solid black',}}>
		{props.ListMessage.map(ChannelMessage)}
		<div id="bottomchatmessage" ref={messagesEndRef} />
        </div>
    )
}

function ContextMenuUser()
{

}

function ChannelUser(user: IUser)
{
	return(
		<Button key={`channel_user_${user.user_id}`} disabled style={{width: "80%", margin: "0.5%"}}>
			<ContextMenuTrigger id={`ContextMenuChannelUser_${user.user_id}`}>
				{user.user_nickname}
			</ContextMenuTrigger>
			{/* <ContextMenuChannelUser /> */}
		</Button>
	)
}

function ListChannelUser(props: {ListUsers: IUser[]})
{
	return (
		<div className="overflow-auto" style={{marginTop: "15%"}}>
			{props.ListUsers.map(ChannelUser)}
		</div>
	)
}

function ChatChannel(channelSelected: IChannel)
{
    const socket = useContext(SocketContext);
    const [ListUsers, SetListUsers] = useState<IUser[]>([]);
    const [ListMessage, SetListMessage] = useState<IMessage[]>([]);
    const [message, SetMessage] = useState<string>("");

    useEffect(() => {

	socket.emit('channel-load', channelSelected.channel_id);
        socket.on('channel-users', (data: IUser[]) => {SetListUsers(data); console.log(data)});
        socket.on('channel-message-list', (data: IMessage[]) => {SetListMessage(data);});

	return (() => {
		socket.emit('channel-unload', {channelId: channelSelected.channel_id});
		socket.off('channel-users');
		socket.off('channel-message-list');
		SetMessage("");});
    }, [channelSelected])

    useEffect(() => {
	socket.on('channel-new-message', (new_message: IMessage) => {
		const buffer = [...ListMessage];
		buffer.push(new_message);
		SetListMessage(buffer)
		});

		return (() => {socket.off('channel-new-message');});
    }, [ListMessage])

    //Form management
    const handleSubmit = (event: any) => {
		event.preventDefault();
		if (message === "")
		{
			event.stopPropagation();
			return ;
		}
		socket.emit('channel-message', {channelId: channelSelected.channel_id, message: message});
		//console.log(`channel ${channelSelected.channel_name} send : ${message}`);
		SetMessage("");
	}

	const ChangeMsg = (e: React.ChangeEvent<HTMLInputElement>) => { SetMessage(e.currentTarget.value);}

	return (
	<Row className="TitleChannel">
		{channelSelected !== undefined
		? <h2 style={{height:"1.2em"}}> {channelSelected.channel_name} </h2>
		: <h2 style={{height:"1.2em"}}></h2>}
		<Col lg={8}>
			<ListChatMessage ListMessage={ListMessage}/>
			<Form className="FormSendMessage justify-content-center" style={{padding:"0px", paddingTop:"0.8em"}}>
				<Form.Control type="text" value={message} placeholder="Message" onChange={ChangeMsg}/>
				<Button type="submit" onClick={handleSubmit}> Send </Button>
			</Form>
		</Col>
		<Col>
			<Button style={{width:"12.5em", borderRadius:"3em"}} variant={"secondary"}> Channel Settings </Button>
			<ListChannelUser ListUsers={ListUsers}/>
		</Col>
	</Row>)
}

export default function InterfaceChat(props: {channelSelected: IChannel | undefined}) {
    return (
    <div>
            {props.channelSelected !== undefined ?
            <ChatChannel 
	    	channel_id={props.channelSelected.channel_id}
		channel_name={props.channelSelected.channel_name}
		role={props.channelSelected.role}/>
            : <ChatDisabled/> }
    </div>
)}
import 'bootstrap/dist/css/bootstrap.min.css'
import { Form, Button, Row, Col, Image, Modal } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import React, {useState, useContext, useEffect, useRef} from 'react'
import {socket, SocketContext} from '../../context/socket'
import './ChatInterface.css'
import {IChannel, Role} from './InterfaceUser'
import {DataContext, Data} from '../../App'
import ListChannelUser from './ListUserChannel'
import ParametersChannel from './ParametersChannel'
import ParametersIcon from '../pictures/parameters-icon.png'

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

type Status = 'Mute' | 'Ban' | 'Normal'

export interface IUser {
    user_id: number,
    user_nickname: string,
    user_avatar: string,
    role: Role,
    status: Status
}

function timeSince(date: any) {

	var options = {year: 'numeric', month: 'long', day: 'numeric',};

	var seconds = Math.floor((new Date().getTime() - date) / 1000);
	var interval = seconds / 2592000;

	if (interval > 1) {
	  return date.toLocaleDateString("en-EN", options);
	}
	interval = seconds / 86400;
	if (interval > 1) {
	  return Math.floor(interval) + " days ago";
	}
	interval = seconds / 3600;
	if (interval > 1) {
	  return Math.floor(interval) + " hours ago";
	}
	interval = seconds / 60;
	if (interval > 1) {
	  return Math.floor(interval) + " minutes ago";
	}
	return "Now";
}

function ChannelMessage(props: {message: IMessage, userData: Data})
{
	let color = (props.message.message_authorId !== props.userData.id) ? '#34b7f1' : '#25d366'

	return (
	<div className={`MsgBubble`} style={{backgroundColor: color}}>
		<Row>
			<Col>
				<Image src={props.message.author_avatar} roundedCircle fluid className="pictureChat" />
			</Col>
			<Col>
				{props.message.author_nickname}
			</Col>
			<Col>
				{ timeSince(new Date(props.message.message_createDate))}
			</Col>
		</Row>
		<Row>
			<Col>
				{props.message.message_content}
			</Col>
		</Row>
	</div>)
}

function ListChatMessage(props: {ListMessage: IMessage[]}) {

	const messagesEndRef = useRef<null | HTMLDivElement>(null)
	const userData = useContext(DataContext);

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
		{props.ListMessage.map((message) => <ChannelMessage
			key={`message_${message.message_channelId}_${message.message_id}`} 
			message={message}
			userData={userData}/>)}
		<div id="bottomchatmessage" ref={messagesEndRef} />
        </div>
    )
}

function ChatChannel(channelSelected: IChannel)
{
    const socket = useContext(SocketContext);
    const userData = useContext(DataContext);
    const [ListUsers, SetListUsers] = useState<IUser[]>([]);
    const [ListMessage, SetListMessage] = useState<IMessage[]>([]);
    const [message, SetMessage] = useState<string>("");

	useEffect(() => {
		//console.log(`channel-load : ${channelSelected.channel_id}`);
		socket.emit('channel-load', channelSelected.channel_id);
	        socket.on('channel-users', (data: IUser[]) => { SetListUsers(data); });
	        socket.on('channel-message-list', (data: IMessage[]) => {SetListMessage(data);});

		return (() => {
			//console.log(`channel-unload: ${channelSelected.channel_id}`);
			socket.emit('channel-unload', channelSelected.channel_id);
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
		{channelSelected !== undefined ?
			<ParametersChannel {...channelSelected} />
		: <h2 style={{height:"1.2em"}}></h2>}
		<Col lg={8}>
			<ListChatMessage ListMessage={ListMessage}/>
			<Form className="FormSendMessage justify-content-center" style={{padding:"0px", paddingTop:"0.8em"}}>
				<Form.Control type="text" value={message} placeholder="Message" onChange={ChangeMsg}/>
				{ListUsers.find((element) => element.user_id === userData.id) !== undefined && ListUsers.find((element) => element.user_id === userData.id)?.status !== 'Mute' ?
					<Button type="submit" onClick={handleSubmit}> Send </Button>
				:	<Button type="submit" variant="danger" disabled> Send </Button>
				}
			</Form>
		</Col>
		<Col>
			<ListChannelUser ListUsers={ListUsers} myrole={channelSelected.role} channelId={channelSelected.channel_id}/>
		</Col>
	</Row>)
}

export default function InterfaceChat(props: {channelSelected: IChannel | undefined}) {
    return (
    <div>
            {props.channelSelected !== undefined ?
            <ChatChannel 
		{...props.channelSelected}
		/>
            : <ChatDisabled/> }
    </div>
)}

function ChatDisabled()
{
	const socket = useContext(SocketContext);

	return (
	<Row className="TitleChannel">
		<Row>
			<Col lg={11}>
				<h2 style={{height:"1.2em"}}>
				</h2>
			</Col>
			<Col>
				<Image className="iconParameters" roundedCircle src={ParametersIcon} />
			</Col>
		</Row>
		<Col lg={8}>
			<ListChatMessage ListMessage={[]}/>
			<Form className="FormSendMessage justify-content-center" style={{padding:"0px", paddingTop:"0.8em"}}>
				<Form.Control type="name" placeholder="Message" />
				<Button type="submit" variant="danger" disabled> Send </Button>
			</Form>
		</Col>
		<Col style={{height:"60em"}}>
			<div style={{height:"40em"}}> list channel participants</div>
		</Col>
	</Row>);
}
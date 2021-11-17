import {IMessage, Message, IUser} from './ChatInterface'
import {DataContext, } from '../../App'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Form, Button, Row, Col, Image, } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import React, {useState, useContext, useEffect, useRef} from 'react'
import {SocketContext} from '../../context/socket'
import './ChatInterface.css'
import {IChannel, } from './InterfaceUser'
import ListChannelUser from './ListUserChannel'
import ParametersChannel from './ParametersChannel'
import ParametersIcon from '../pictures/parameters-icon.png'


function ListChannelMessage(props: {ListMessage: IMessage[]}) {

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
		{props.ListMessage.map((message) => <Message
			key={`message_${message.message_channelId}_${message.message_id}`} 
			message={message}
			userData={userData}/>)}
		<div id="bottomchatmessage" ref={messagesEndRef} />
        </div>
    )
}

export function ChatChannel(channelSelected: IChannel)
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
			<ListChannelMessage ListMessage={ListMessage}/>
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

export function ChatChannelDisabled()
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
			<ListChannelMessage ListMessage={[]}/>
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
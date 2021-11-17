import 'bootstrap/dist/css/bootstrap.min.css'
import { Row, Col, Image, } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './ChatInterface.css'
import {IChannel, IUserConversation, messageType, Role} from './InterfaceUser'
import {Data} from '../../App'
import {ChatChannel, ChatChannelDisabled} from './ChatChannel'
import {ChatPrivate, ChatPrivateDisabled} from './ChatPrivate'

/* 
****CHAT****
*/

type Status = 'Mute' | 'Ban' | 'Normal'

export interface IMessage {
    message_id: number,
    message_channelId: number,
    message_authorId: number,
    message_content: string,
    message_createDate: Date,
    author_nickname: string,
    author_avatar: string,
}

export interface IUser {
    user_id: number,
    user_nickname: string,
    user_avatar: string,
    role: Role,
    status: Status,
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

export function Message(props: {message: IMessage, userData: Data})
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

export default function InterfaceChat(props: {channelSelected: IChannel | undefined, privateSelected: IUserConversation | undefined, messageType: messageType}) {
    return (
    <div>
            {props.messageType === 'Channel' 
	    ?
		props.channelSelected !== undefined ?
			<ChatChannel {...props.channelSelected} />
			: <ChatChannelDisabled/>
	    :
	    	props.privateSelected !== undefined ?
			<ChatPrivate privateSelected={props.privateSelected}/>
			: <ChatPrivateDisabled/>}
    </div>
)}


import { useEffect, useContext, useState } from 'react'
import {Row, Col} from 'react-bootstrap'
import { SocketContext } from '../../context/socket'
import { IUserConversation } from './InterfaceUser'
import {IMessage} from './ChatInterface'
import './ChatPrivate.css'

export function ChatPrivate(props : {privateSelected: IUserConversation})
{
	const socket = useContext(SocketContext);
	const [listMessage, setListMessage] = useState<IMessage[]>([]);

	useEffect(() => {
		socket.emit('private-load', {userId: props.privateSelected.user_id});
		console.log(`in private-load : ${props.privateSelected.user_id}`);
		setListMessage([{
		message_id: 4,
		message_channelId: 3,
		message_authorId: 60044,
		message_content: "hello",
		message_createDate: new Date,
		author_nickname: "abourbou",
		author_avatar: "https://cdn.quotesgram.com/img/28/47/1330623493-cute-animals-funny-angry-grumpy-bird-chick-shouting-pics.jpg",
		}, 
		{
		message_id: 4,
		message_channelId: 3,
		message_authorId: 119,
		message_content: "hello you",
		message_createDate: new Date,
		author_nickname: "abourbou",
		author_avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThwiemz7G739IZ1_kEuf22cm-Ku9HbUs_yZw&usqp=CAU",
		}], )
		//return (() => {socket.emit('private-unload', {channelId: })});
	}, [socket])

	return (
		<div>
			<Row className="OtherUser">
				<Col>
					name user {props.privateSelected.user_id}
				</Col>
			</Row>
			<Row className="ChatPrivate">
				<Col>
					chat
				</Col>
			</Row>
			<Row className="MessageForm">
				<Col>
					send a message
				</Col>
			</Row>
		</div>
	)
}

export function ChatPrivateDisabled()
{
	const socket = useContext(SocketContext);

	return (
		<div>

		<Row className="OtherUser">
		<Col>
			No user
		</Col>
		</Row>
		<Row className="ChatPrivate">
			<Col>
				chat
			</Col>
		</Row>
		<Row className="MessageForm">
			<Col>
				where you send a message
			</Col>
		</Row>
		</div>
	)
}
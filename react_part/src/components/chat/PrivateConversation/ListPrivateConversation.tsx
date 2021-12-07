
import React, { useContext, useEffect, useState } from 'react'
import {Row, Button, Col} from 'react-bootstrap'
import { SocketContext } from '../../../context/socket'
import { IUserConversation } from '../../web_pages/UserPart';
import './ListPrivateConversation.css'

interface IConversation {
	channel_id: number,
	user_id: number,
	user_name: string,
	user_avatar: string,
}

function ButtonPrivateConversation(props: {Conversation: IConversation, setUserConversationSelected: any})
{
	console.log(`name: ${props.Conversation.user_name}`);
	return (
		<Button
		key={`PrivateConversation-${props.Conversation.user_id}`}
		className="ButtonConversation"
		onClick={() => props.setUserConversationSelected({user_id: props.Conversation.user_id})}>
			{props.Conversation.user_name}

		</Button>
	)
}

export default function ListPrivateConversation(props: {setUserConversationSelected: React.Dispatch<React.SetStateAction<IUserConversation | undefined>>})
{
	let socket = useContext(SocketContext);
	const [PrivateConversation, setPrivateConversation] = useState<IConversation[]>([]);

	useEffect(() => {
		socket.emit("private-ask-reload");
	}, [socket])

	useEffect(() => {
		socket.on("private-list", (list: IConversation[]) => {setPrivateConversation(list); console.log(list)});
		return (() => {socket.off('private-list')})
	}, [PrivateConversation, socket])

	return (
	<Row className="ScrollingListPrivate">
		<Col style={{overflow: 'auto', marginBottom: '20px'}} lg={6}>
		{ PrivateConversation.length !== 0
		?	PrivateConversation.map((Conversation) => ButtonPrivateConversation({Conversation: Conversation, setUserConversationSelected: props.setUserConversationSelected}))
		:	<div></div>
		}
		</Col>
	</Row>
	)
}

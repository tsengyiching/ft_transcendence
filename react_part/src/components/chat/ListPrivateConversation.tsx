
import { useContext, useEffect, useState } from 'react'
import {Row, Col} from 'react-bootstrap'
import { SocketContext } from '../../context/socket'
import { IChannel } from './InterfaceUser';
import './ListPrivateConversation.css'

function ButtonPrivateConversation(Channel: IChannel)
{
	<div> {Channel.channel_name} </div>
}

export default function ListPrivateConversation()
{
	let socket = useContext(SocketContext);
	const [PrivateConversation, setPrivateConversation] = useState<IChannel[]>([]);

	useEffect(() => {
		socket.emit("private-ask-reload");
	}, [socket])

	useEffect(() => {
		socket.on("private-list", (list: IChannel[]) => {setPrivateConversation(list); console.log(list)});
		return (() => {socket.off('private-list')})
	}, [PrivateConversation])

	return (
		<Row className="ScrollingListPrivate">
			{ PrivateConversation.length !== 0
			? <div style={{overflow: 'auto', height: '7.9em'}}>
				{ PrivateConversation.map(ButtonPrivateConversation) }
			</div>
			: <div> No private Conversation</div>
		}
		</Row>
	)
}
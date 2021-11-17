
import { useContext, useEffect, useState } from 'react'
import {Row, Col} from 'react-bootstrap'
import { SocketContext } from '../../context/socket'
import { IChannel } from './InterfaceUser';
import './ListPrivateMessage.css'

function ButtonPrivateMessage(Channel: IChannel)
{
	<div> {Channel.channel_name} </div>
}

export default function ListPrivateMessage()
{
	let socket = useContext(SocketContext);
	const [PrivateMessages, setPrivateMessages] = useState<IChannel[]>([]);

	useEffect(() => {
		socket.emit("private-ask-reload");
	}, [socket])

	useEffect(() => {
		socket.on("private-list", (list: IChannel[]) => {setPrivateMessages(list); console.log(list)});
		
		return (() => {socket.off('private-list')})
	}, [PrivateMessages])

	return (
		<Row className="ScrollingListPrivate">
			{ PrivateMessages.length !== 0
			? <div style={{overflow: 'auto', height: '7.9em'}}>
				{ PrivateMessages.map(ButtonPrivateMessage) }
			</div>
			: <div> No private message</div>
		}
		</Row>
	)
}
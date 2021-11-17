
import { useEffect, useContext } from 'react'
import {Row, } from 'react-bootstrap'
import { SocketContext } from '../../context/socket'
import { IPrivateMessage } from './InterfaceUser'

export function ChatPrivate(props : {privateSelected: IPrivateMessage})
{
	const socket = useContext(SocketContext)

	useEffect(() => {
		socket.emit('private-load', {userId: props.privateSelected.user_id});

		//return (() => {socket.emit('private-unload', {channelId: })});
	}, [socket])

	return (
		<Row className="ScrollingList">
			Chat Private with {props.privateSelected.user_id}
		</Row>
	)
}
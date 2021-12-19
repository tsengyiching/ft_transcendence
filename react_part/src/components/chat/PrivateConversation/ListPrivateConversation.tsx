import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import {Row, Button, Col} from 'react-bootstrap'
import { SocketContext } from '../../../context/socket'
import { IUserConversation } from '../../web_pages/UserPart';
import './ListPrivateConversation.css'
import {IBlockedUser} from '../../members/ListBlockedUsers'
import { Block } from '../../members/ContextMenuFunctions';

interface IConversation {
	channel_id: number,
	user_id: number,
	user_name: string,
	user_avatar: string,
}

function ButtonPrivateConversation(props: {Conversation: IConversation, setUserConversationSelected: any})
{
	return (
		<Button
		key={`PrivateConversation-${props.Conversation.user_id}`}
		className="ButtonConversation"
		onClick={() => props.setUserConversationSelected({user_id: props.Conversation.user_id})}>
			{props.Conversation.user_name}

		</Button>
	)
}

export default function ListPrivateConversation(props: {
	setUserConversationSelected: React.Dispatch<React.SetStateAction<IUserConversation | undefined>>
	BlockedUsers : IBlockedUser[]})
{
	let socket = useContext(SocketContext);
	const [PrivateConversation, setPrivateConversation] = useState<IConversation[]>([]);
	const [AllPrivateConversation, setAllPrivateConversation] = useState<IConversation[]>([]);

/*  	//get list blocked at the mount of the component + start listening socket
	useEffect(() => {
		console.log("1 useEffect")
		let isMounted = true;
		axios.get('http://' + process.env.REACT_APP_DOMAIN_BACKEND + '/relationship/me/list?status=block', {withCredentials: true,})
		.then(res => { if(isMounted)
			SetBlockedUsers(res.data);
		})
		.catch(res => { if (isMounted)
			console.log("error on getting data blocked users");
		})
		setTimeout(console.log, 100, BlockedUsers)
		socket.on("reload-block", () => {console.log("in the socket"); SetReloadBlockedUserlist(ReloadBlockedUserlist + 1); });

		return (() => { socket.off("reload-block"); isMounted = false; });
	}, [ReloadBlockedUserlist, socket]); */

	useEffect(() => {
		socket.emit("private-ask-reload");
	}, [])

	useEffect(() => {
		socket.on("private-list", (list: IConversation[]) => { setAllPrivateConversation(list);});
		return (() => {socket.off("private-list");});
	}, [AllPrivateConversation])

	useEffect(() => {
		const newlist : IConversation[] = [];
		for (const conversation of AllPrivateConversation)
		{
			if (props.BlockedUsers.find((blockedUser) => blockedUser.user_id === conversation.user_id) === undefined)
			{
				newlist.push(conversation);
			}
		}
		setPrivateConversation(newlist);
	}, [socket, AllPrivateConversation, props.BlockedUsers,])

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

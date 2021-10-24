import { useState, useEffect, MouseEventHandler,  } from "react"
import { socket } from "../../context/socket";
import {Image, Button} from 'react-bootstrap'
import axios from 'axios'
import "./ListBlockedUsers.css"
import './members.css'
import status from './Status'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {InvitateToGame} from './ContextMenuFunctions'

interface IBlockedUser {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: 'Available' | 'Playing' | 'Offline'}

function ConTextMenuBlockedUser(props: {BlockedUser: IBlockedUser})
{
	return (
	<ContextMenu id={`ContextMenuBlockedUser_${props.BlockedUser.user_id}`}>
		<MenuItem>
			View Profile
		</MenuItem>
		<MenuItem>
			Unblock
		</MenuItem>
	</ContextMenu>
	)
}

function BlockedUser(BlockedUser: IBlockedUser)
	{
		return (
			<div>
			<ContextMenuTrigger id={`ContextMenuBlockedUser_${BlockedUser.user_id}`}>
			<div key={`BlockedUser_${BlockedUser.user_id}`} className="BlockedUser UserButton">
				<Image src={BlockedUser.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
				{BlockedUser.user_nickname}
				{status(BlockedUser.user_userStatus)}
			</div>
			</ContextMenuTrigger>
			<ConTextMenuBlockedUser BlockedUser={BlockedUser}/>

			</div>
		)
		//console.log(`BlockedUser : ${BlockedUser}`)
	}

export default function ListBlockedUsers()
{
	const [BlockedUsers, SetBlockedUsers] = useState<IBlockedUser[]>([]);
	const [ReloadBlockedUserlist, SetReloadBlockedUserlist] = useState<boolean>(true);

	useEffect(() => {
		socket.on('reload-status', () => {SetReloadBlockedUserlist(!ReloadBlockedUserlist)});
		return (() => {socket.off('reload-status');});
	}, [])

	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/list?status=block", {withCredentials: true,})
		.then(res => {
			SetBlockedUsers(res.data);
		})
		.catch(res => {
			console.log("error");
		})
		SetBlockedUsers([{user_id: 1, user_avatar: "https://ichef.bbci.co.uk/news/999/cpsprodpb/15951/production/_117310488_16.jpg"
						, user_nickname: "Theo", user_userStatus: "Playing"}])
		//console.log(BlockedUsers);
	}, [ReloadBlockedUserlist]);

	return (
		<div className="ScrollingListBlockedUsers">
			{BlockedUsers.map(BlockedUser)}
			{/*<Button onClick={() => SetReloadBlockedUserlist(!ReloadBlockedUserlist)}> Reload BlockedUsers
			</Button>*/}
		</div>
	)
}
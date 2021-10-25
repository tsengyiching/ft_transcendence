import { useState, useEffect, MouseEventHandler,  } from "react"
import { socket } from "../../context/socket";
import {Image, Button} from 'react-bootstrap'
import axios from 'axios'
import "./ListFriends.css"
import './members.css'
import status from './Status'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {InvitateToGame} from './ContextMenuFunctions'

interface IFriend {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: 'Available' | 'Playing' | 'Offline'}

function ConTextMenuFriend(props: {Friend: IFriend})
{
	return (
	<ContextMenu id={`ContextMenuFriend_${props.Friend.user_id}`}>

		{	props.Friend.user_userStatus === 'Available' &&
		<div>
		<MenuItem>
			<div onClick={() => InvitateToGame(props.Friend.user_id)}> Invitate to game </div>
		</MenuItem>
		<MenuItem>
			Send a message
		</MenuItem>
		</div>
		}
		{ props.Friend.user_userStatus === 'Playing' &&
		<div>
		<MenuItem> <div> Spectate Game </div></MenuItem>
		<MenuItem>
			Send a message
		</MenuItem>
		</div>
		}
		<MenuItem>
			View Profile
		</MenuItem>

		<MenuItem>
			Unfriend
		</MenuItem>
		<MenuItem>
			Block
		</MenuItem>
	</ContextMenu>
	)
}

function Friend(Friend: IFriend)
	{
		return (
			<div>
			<ContextMenuTrigger id={`ContextMenuFriend_${Friend.user_id}`}>
			<div key={`Friend_${Friend.user_id}`} className="Friend UserButton">
				<Image src={Friend.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
				{Friend.user_nickname}
				{status(Friend.user_userStatus)}
			</div>
			</ContextMenuTrigger>
			<ConTextMenuFriend Friend={Friend}/>

			</div>
		)
		//console.log(`Friend : ${Friend}`)
	}

export default function ListFriends()
{
	const [Friends, SetFriends] = useState<IFriend[]>([]);
	const [ReloadFriendlist, SetReloadFriendlist] = useState<boolean>(true);

	useEffect(() => {
		socket.on('reload-status', () => {SetReloadFriendlist(!ReloadFriendlist)});
		return (() => {socket.off('reload-status');});
	}, [])

	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/list?status=friend", {withCredentials: true,})
		.then(res => {
			SetFriends(res.data);
		})
		.catch(res => {
			console.log("error");
		})
		//console.log(Friends);
	}, [ReloadFriendlist]);

	return (
		<div className="ScrollingListMemebers">
			{Friends.map(Friend)}
			{/*<Button onClick={() => SetReloadFriendlist(!ReloadFriendlist)}> Reload Friends
			</Button>*/}
		</div>
	)
}
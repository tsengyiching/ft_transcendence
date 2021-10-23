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

			<ContextMenu id={`ContextMenuFriend_${Friend.user_id}`}>

				<MenuItem>
				{
					Friend.user_userStatus === 'Available' ? <div onClick={() => InvitateToGame(Friend.user_id)}> Invitate to game </div>
					: Friend.user_userStatus === 'Playing' ? <div> Spectate Game </div>
					:										<div className='Unavailable'> Invitate to game </div>
				}
				</MenuItem>
				<MenuItem>
					Send a message
				</MenuItem>
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
			</div>
		)
		//console.log(`Friend : ${Friend}`)
	}

export default function ListFriends()
{
	const [Friends, SetFriends] = useState<IFriend[]>([]);
	const [ReloadFriendlist, SetReloadFriendlist] = useState<boolean>(true);

	useEffect(() => {
		socket.on('reload-friendlist', () => {SetReloadFriendlist(!ReloadFriendlist)});
	}, [])

	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/list?status=friend", {withCredentials: true,})
		.then(res => {
			SetFriends(res.data);
		})
		.catch(res => {
			console.log("error");
		})
		SetFriends([{user_id: 1, user_avatar: "https://ichef.bbci.co.uk/news/999/cpsprodpb/15951/production/_117310488_16.jpg"
						, user_nickname: "Theo", user_userStatus: "Offline"}])
		//console.log(Friends);
	}, [ReloadFriendlist]);

	return (
		<div className="ScrollingListFriends">
			{Friends.map(Friend)}
			{/*<Button onClick={() => SetReloadFriendlist(!ReloadFriendlist)}> Reload Friends
			</Button>*/}
		</div>
	)
}
import { useState, useEffect, } from "react"
import { socket } from "../../context/socket";
import {Image} from 'react-bootstrap'
import axios from 'axios'
import "./ListUsers.css"
import './members.css'
import status from './Status'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

interface IUser {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: 'Available' | 'Playing' | 'Offline'}

function ConTextMenuUser(props: {User: IUser})
{
	return (
	<ContextMenu id={`ContextMenuUser_${props.User.user_id}`}>

		{ props.User.user_userStatus !== 'Offline' &&
		<div>
		<MenuItem>
			Send a message
		</MenuItem>
		</div>
		}
		<MenuItem>
			View Profile
		</MenuItem>

		<MenuItem>
			Add Friend / Unfriend
		</MenuItem>
		<MenuItem>
			Block / Unblock
		</MenuItem>
	</ContextMenu>
	)
}

function User(User: IUser)
	{
		return (
			<div>
			<ContextMenuTrigger id={`ContextMenuUser_${User.user_id}`}>
			<div key={`User_${User.user_id}`} className="User UserButton">
				<Image src={User.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
				{User.user_nickname}
				{status(User.user_userStatus)}
			</div>
			</ContextMenuTrigger>
			<ConTextMenuUser User={User}/>

			</div>
		)
		//console.log(`User : ${User}`)
	}

export default function ListUsers()
{
	const [Users, SetUsers] = useState<IUser[]>([]);
	const [ReloadUserlist, SetReloadUserlist] = useState<boolean>(true);

	useEffect(() => {
		socket.on('reload-status', () => {SetReloadUserlist(!ReloadUserlist)});
		return (() => {socket.off('reload-status');});
	}, [])

	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/list", {withCredentials: true,})
		.then(res => {
			SetUsers(res.data);
		})
		.catch(res => {
			console.log("error");
		})
		//console.log(Users);
	}, [ReloadUserlist]);

	return (
		<div className="ScrollingListMembers">
			{Users.map(User)}
			{/*<Button onClick={() => SetReloadUserlist(!ReloadUserlist)}> Reload Users
			</Button>*/}
		</div>
	)
}
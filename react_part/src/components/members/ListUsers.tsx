import { useState, useEffect, } from "react"
import { socket } from "../../context/socket";
import {Image, Col, Row} from 'react-bootstrap'
import axios from 'axios'
import "./ListUsers.css"
import './members.css'
import status from './Status'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

interface IUser {
	id: number;
	nickname: string;
	avatar: string;
	userStatus: 'Available' | 'Playing' | 'Offline';
	relationship: null | 'friend' | 'block' | 'Not confirmed'}

function ContextMenuUser(props: {User: IUser})
{
	return (
	<ContextMenu id={`ContextMenuUser_${props.User.id}`}>

		{ props.User.userStatus !== 'Offline' &&
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
			<ContextMenuTrigger id={`ContextMenuUser_${User.id}`}>
			<div key={`User_${User.id}`} className="User UserButton">
			<Row>
				<Col lg={3}>
					<Image src={User.avatar} className="PictureUser" alt="picture" rounded fluid/>
				</Col>
				<Col lg={5}>
					<div style={{margin:"1em"}}> {User.nickname} </div>
				</Col>
				<Col>
					{status(User.userStatus)}
				</Col>
			</Row>
			</div>
			</ContextMenuTrigger>
			<ContextMenuUser User={User}/>

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
		axios.get("http://localhost:8080/relationship/me/allusers", {withCredentials: true,})
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
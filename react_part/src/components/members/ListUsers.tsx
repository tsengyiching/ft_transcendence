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

type StatusType = 'Available' | 'Playing' | 'Offline';

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
			<div key={`User_${User.id}`}>
			<ContextMenuTrigger id={`ContextMenuUser_${User.id}`}>
			<div className="User UserButton">
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
	const [ReloadStatus, SetReloadStatus] = useState<{user_id: number, status: StatusType}>({user_id: 0, status: 'Available'});
	const [RefreshVar, SetRefreshVar] = useState<boolean>(false);

	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/allusers", {withCredentials: true,})
		.then(res => {
			SetUsers(res.data);
		})
		.catch(res => {
			console.log("error");
		})
		socket.on('reload-status', (data: {user_id: number, status: StatusType}) => {SetReloadStatus(data)});
		
		return (() => {socket.off('reload-status');});
		//console.log(Users);
	}, []);

	//actualize the status
	useEffect(() => {
		if (ReloadStatus.user_id !== 0)
		{
			//console.log("in reloadstatus effect");
			const user = Users.find(element => element.id === ReloadStatus.user_id)
			if (user !== undefined)
			{
			//console.log("change status");
			user.userStatus = ReloadStatus.status;
			SetRefreshVar(!RefreshVar);
			}
		}
	}, [ReloadStatus])

	return (
		<div className="ScrollingListMembers">
			{Users.map(User)}
			{/*<Button onClick={() => SetReloadUserlist(!ReloadUserlist)}> Reload Users
			</Button>*/}
		</div>
	)
}
import { useState, useEffect, useContext,  } from "react"
import { socket } from "../../context/socket";
import {Image, Button, Col, Row} from 'react-bootstrap'
import axios from 'axios'
import "./ListBlockedUsers.css"
import './members.css'
import status from './Status'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {InvitateToGame} from './ContextMenuFunctions'
import {DataContext} from "../../App"

interface IBlockedUser {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: StatusType}

type StatusType = 'Available' | 'Playing' | 'Offline';

function ContextMenuBlockedUser(props: {BlockedUser: IBlockedUser})
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
			<div key={`BlockedUser_${BlockedUser.user_id}`}>
			<ContextMenuTrigger id={`ContextMenuBlockedUser_${BlockedUser.user_id}`}>
			<div className="BlockedUser UserButton">
			<Row>
			<Col lg={3}>
				<Image src={BlockedUser.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
			</Col>
			<Col lg={5}>
				<div style={{margin:"1em"}}> {BlockedUser.user_nickname} </div>
			</Col>
			<Col>
				{status(BlockedUser.user_userStatus)}
			</Col>
			</Row>
			</div>
			</ContextMenuTrigger>
			<ContextMenuBlockedUser BlockedUser={BlockedUser}/>

			</div>
		)
		//console.log(`BlockedUser : ${BlockedUser}`)
	}

export default function ListBlockedUsers()
{
	const [RefreshVar, SetRefreshVar] = useState<boolean>(false);
	const [BlockedUsers, SetBlockedUsers] = useState<IBlockedUser[]>([]);
	const [ReloadBlockedUserlist, SetReloadBlockedUserlist] = useState<{user_id1: number, user_id2: number}>({user_id1: 0, user_id2: 0});
	const [ReloadStatus, SetReloadStatus] = useState<{user_id: number, status: StatusType}>({user_id: 0, status: 'Available'});
	const userData = useContext(DataContext);

	//get list blocked at the mount of the component + start listening socket
	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/list?status=block", {withCredentials: true,})
		.then(res => {
			SetBlockedUsers(res.data);
		})
		.catch(res => {
			console.log("error");
		})

		socket.on('reload-status', (data: {user_id: number, status: StatusType}) => {SetReloadStatus(data)});
		socket.on("reload-blocked", (data: {user_id1: number, user_id2: number}) => {
			SetReloadBlockedUserlist({user_id1: data.user_id1, user_id2: data.user_id2})});

		return (() => {socket.off('reload-status'); socket.off('reload-blocked');});
	}, []);

	//actualize the blockedlist
	useEffect(() => {
		if (userData.id === ReloadBlockedUserlist.user_id1 || userData.id == ReloadBlockedUserlist.user_id2)
		{
			axios.get("http://localhost:8080/relationship/me/list?status=block", {withCredentials: true,})
			.then(res => {
				SetBlockedUsers(res.data);
			})
			.catch(res => {
				console.log(res.data);
			})
		}
	}, [ReloadBlockedUserlist, userData.id])

	//actualize the status
	useEffect(() => {
		if (ReloadStatus.user_id !== 0)
		{
			const blocked = BlockedUsers.find(element => element.user_id === ReloadStatus.user_id)
			if (blocked !== undefined)
			{
				blocked.user_userStatus = ReloadStatus.status;
				SetRefreshVar(!RefreshVar);
			}
		}
	}, [ReloadStatus])

	return (
		<div className="ScrollingListMembers">
			{BlockedUsers.map(BlockedUser)}
			{/*<Button onClick={() => SetReloadBlockedUserlist(!ReloadBlockedUserlist)}> Reload BlockedUsers
			</Button>*/}
		</div>
	)
}
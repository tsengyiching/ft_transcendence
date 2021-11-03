import { useState, useEffect, useContext} from "react"
import { socket } from "../../context/socket";
import {Image, Col, Row} from 'react-bootstrap'
import axios from 'axios'
import "./ListUsers.css"
import './members.css'
import status from './Status'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {DataContext} from "../../App" 
import {Unfriend, Askfriend, Block, } from "./ContextMenuFunctions";
import {useHistory} from "react-router-dom"

interface IUser {
	id: number;
	nickname: string;
	avatar: string;
	userStatus: 'Available' | 'Playing' | 'Offline';
	relationship: null | 'Friend' | 'Block' | 'Not confirmed'}

type StatusType = 'Available' | 'Playing' | 'Offline';

export default function ListUsers()
{
	function ContextMenuUser(props: {User: IUser})
	{
		//console.log(`${props.User.nickname} : ${props.User.relationship}`)
	
		return (
		<ContextMenu id={`ContextMenuUser_${props.User.id}`}>
	
			{ props.User.userStatus !== 'Offline' &&
			<div>
			<MenuItem>
				Send a message
			</MenuItem>
			</div>
			}
			<MenuItem onClick={() => history.push(`/profile/${props.User.id}`)}>
				View Profile
			</MenuItem>
			
			{ props.User.relationship !== 'Friend' &&
			<MenuItem onClick={() => Askfriend(props.User.id)}>
				Add Friend
			</MenuItem>}
	
			{ props.User.relationship === 'Friend' &&
			<MenuItem onClick={() => Unfriend(props.User.id)}>
				Unfriend
			</MenuItem>}
			
			<MenuItem onClick={() => Block(props.User.id)}>
				Block
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

	const [Users, SetUsers] = useState<IUser[]>([]);
	const [ReloadUserlist, SetReloadUserlist] = useState<{user_id1: number, user_id2: number}>({user_id1: -1, user_id2: -1});
	const [ReloadStatus, SetReloadStatus] = useState<{user_id: number, status: StatusType}>({user_id: 0, status: 'Available'});
	const [RefreshVar, SetRefreshVar] = useState<boolean>(false);
	const userData = useContext(DataContext);
	let history = useHistory();

	useEffect(() => {
		let isMounted = true;
		axios.get("http://localhost:8080/relationship/me/allusers", {withCredentials: true,})
		.then(res => { if (isMounted)
			SetUsers(res.data);
		})
		.catch(res => { if (isMounted)
			console.log("error");
		})
		socket.on('reload-status', (data: {user_id: number, status: StatusType}) => {SetReloadStatus(data)});
		socket.on('reload-users', (data: {user_id1: number, user_id2: number}) => {SetReloadUserlist(data)});
		return (() => {socket.off('reload-status'); socket.off('reload-users'); isMounted = false;});
		//console.log(Users);
	}, []);

	//actualize the list of users	
	useEffect(() => {
		let isMounted = true;
		if (userData.id === ReloadUserlist.user_id1 || userData.id === ReloadUserlist.user_id2)
		{
			axios.get("http://localhost:8080/relationship/me/allusers", {withCredentials: true,})
			.then(res => { if (isMounted)
				SetUsers(res.data);
			})
			.catch(res => { if (isMounted)
				console.log("error");
			})
		}
		return (() => {isMounted = false})
	}, [ReloadUserlist, userData.id])

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ReloadStatus])

	return (
		<div className="ScrollingListMembers">
			{Users.map(User)}
			{/*<Button onClick={() => SetReloadUserlist(!ReloadUserlist)}> Reload Users
			</Button>*/}
		</div>
	)
}
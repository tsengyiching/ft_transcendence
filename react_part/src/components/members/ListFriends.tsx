import { useState, useEffect, useContext } from "react"
import { socket } from "../../context/socket";
import {Image, Col, Row, Button, Alert} from 'react-bootstrap'
import axios from 'axios'
import "./ListFriends.css"
import './members.css'
import status from './Status'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {InvitateToGame, SendMessage, SpectateGame, Unfriend} from './ContextMenuFunctions'
import { DataContext } from "../../App";

interface IFriend {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: StatusType}

type StatusType = 'Available' | 'Playing' | 'Offline';

function ContextMenuFriend(props: {Friend: IFriend})
{
	return (
	<ContextMenu id={`ContextMenuFriend_${props.Friend.user_id}`}>

		{	props.Friend.user_userStatus === 'Available' &&
		<MenuItem onClick={() => InvitateToGame(props.Friend.user_id)}>
			Invitate to game
		</MenuItem>}

		{ props.Friend.user_userStatus === 'Playing' &&
		<MenuItem onClick={() => SpectateGame(props.Friend.user_id)}>
			Spectate Game
		</MenuItem>}

		<MenuItem onClick={() => SendMessage(props.Friend.user_id)}>
			Send a message
		</MenuItem>

		<MenuItem>
			View Profile
		</MenuItem>

		<MenuItem onClick={() => Unfriend(props.Friend.user_id)} >
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
			<div key={`Friend_${Friend.user_id}`}>
			<ContextMenuTrigger id={`ContextMenuFriend_${Friend.user_id}`}>
			<div key={`Friend_${Friend.user_id}`} className="Friend UserButton">
			<Row>
				<Col lg={3}>
					<Image src={Friend.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
				</Col>
				<Col lg={5}>
					<div style={{margin:"1em"}}> {Friend.user_nickname} </div>
				</Col>
				<Col>
					{status(Friend.user_userStatus)}
				</Col>
			</Row>
			</div>
			</ContextMenuTrigger>
			<ContextMenuFriend Friend={Friend}/>

			</div>
		)
		//console.log(`Friend : ${Friend}`)
	}

export default function ListFriends()
{
	const [Friends, SetFriends] = useState<IFriend[]>([]);
	const [ReloadFriendlist, SetReloadFriendlist] = useState<{user_id1: number, user_id2: number}>({user_id1: 0, user_id2: 0});
	const [ReloadStatus, SetReloadStatus] = useState<{user_id: number, status: StatusType}>({user_id: 0, status: 'Available'});
	const [RefreshVar, SetRefreshVar] = useState<boolean>(false);
	const userData = useContext(DataContext);
	

	//* TO DO socket for ReloadFriendlist + ReloadStatus in Back

	//get list of friends at the mount of the component + start listening socket
	useEffect(() => {
		//console.log("in the first useEffect");
		let isMounted = true;
		axios.get("http://localhost:8080/relationship/me/list?status=friend", {withCredentials: true,})
		.then(res => { if (isMounted)
			SetFriends(res.data);
		})
		.catch(res => { if (isMounted)
			console.log("error");
		})
		
		socket.on('reload-status', (data: {user_id: number, status: StatusType}) => {SetReloadStatus(data)});
		socket.on("reload-friendlist", (data: {user_id1: number, user_id2: number}) => {
			SetReloadFriendlist({user_id1: data.user_id1, user_id2: data.user_id2});
		})
		return (() => {socket.off("reload-friendlist"); socket.off("reload-status"); isMounted = false;});
	}, [axios])

	//actualize the friendlist
	useEffect(() => {
		//console.log("in reload friendlist");
		let isMounted = true;
		if (userData.id === ReloadFriendlist.user_id1 || userData.id === ReloadFriendlist.user_id2)
		{
		axios.get("http://localhost:8080/relationship/me/list?status=friend", {withCredentials: true,})
		.then(res => { if (isMounted)
			SetFriends(res.data);
		})
		.catch(res => { if (isMounted)
			console.log("error");
		})
		}
		return (() => {isMounted = false});
	}, [ReloadFriendlist, axios])

	//actualize the status
	useEffect(() => {
		//console.log("in actualize status");
		if (ReloadStatus.user_id !== 0)
		{
			const friend = Friends.find(element => element.user_id === ReloadStatus.user_id)
			if (friend !== undefined)
			{
				friend.user_userStatus = ReloadStatus.status;
				SetRefreshVar(!RefreshVar);
			}
		}
	}, [ReloadStatus])

	return (
		<div className="ScrollingListMemebers">
			{Friends.map(Friend)}
		</div>
	)
}
import { useState, useEffect, MouseEventHandler,  } from "react"
import { socket } from "../../context/socket";
import {Image, Button} from 'react-bootstrap'
import axios from 'axios'
import "./ListFriendRequests.css"
import './members.css'
import ApprovedButton from '../pictures/approved_button.png'
import DeclineButton from '../pictures/decline_button.png'
import {ValidationFriend} from "./ContextMenuFunctions"

interface IFriendRequest {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: 'Available' | 'Playing' | 'Offline'}

function FriendRequest(FriendRequest: IFriendRequest)
	{
		return (
			<div key={`FriendRequest_${FriendRequest.user_id}`} className="FriendRequest UserButton">
				<Image src={FriendRequest.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
				{FriendRequest.user_nickname}
				<Image className="ValidationButton" src={ApprovedButton} rounded onClick={() => ValidationFriend(FriendRequest.user_id, true)}/>
				<Image className="ValidationButton" src={DeclineButton} rounded onClick={() => ValidationFriend(FriendRequest.user_id, false)}/>
			</div>
		)
		//console.log(`FriendRequest : ${FriendRequest}`)
	}

export default function ListFriendRequests()
{
	const [FriendRequests, SetFriendRequests] = useState<IFriendRequest[]>([]);
	const [ReloadFriendRequestlist, SetReloadFriendRequestlist] = useState<boolean>(true);

	useEffect(() => {
		socket.on('reload-friend-requests', () => {SetReloadFriendRequestlist(!ReloadFriendRequestlist)});
		return (() => {socket.off('reload-friend-requests');});
	}, [])

	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/list?status=notconfirmed", {withCredentials: true,})
		.then(res => {
			SetFriendRequests(res.data);
		})
		.catch(res => {
			console.log("error");
		})
		//console.log(FriendRequests);
	}, [ReloadFriendRequestlist]);

	return (
		<div className="ScrollingListMembers">
			{FriendRequests.map(FriendRequest)}
			{/*<Button onClick={() => SetReloadFriendRequestlist(!ReloadFriendRequestlist)}> Reload FriendRequests
			</Button>*/}
		</div>
	)
}
import { useState, useEffect, useContext,  } from "react"
import { socket } from "../../context/socket";
import {Image, Col, Row, Button} from 'react-bootstrap'
import axios from 'axios'
import "./ListFriendRequests.css"
import './members.css'
import ApprovedButton from '../pictures/approved_button.png'
import DeclineButton from '../pictures/decline_button.png'
import {ValidationFriend} from "./ContextMenuFunctions"
import {DataContext} from '../../App'

interface IFriendRequest {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: 'Available' | 'Playing' | 'Offline';
	relation_id: number;
}

export default function ListFriendRequests()
{
	const [FriendRequests, SetFriendRequests] = useState<IFriendRequest[]>([]);
	const [ReloadFriendRequestlist, SetReloadFriendRequestlist] = useState<{user_id: number}>({user_id: -1});
	const DataUser = useContext(DataContext);
	const ReloadComponent = () => SetReloadFriendRequestlist({user_id: DataUser.id});


	//load list friend requests
	useEffect(() => {
		//console.log("Friend Request reloaded!")
		axios.get("http://localhost:8080/relationship/me/list?status=notconfirmed", {withCredentials: true,})
		.then(res => {
			SetFriendRequests(res.data);
		})
		.catch(res => {
			console.log(`error: ${res}`);
		})
		socket.on('reload-request', (data: {user_id: number}) => {SetReloadFriendRequestlist(data)});
		return (() => {socket.off('reload-request')});
	}, []);

	//reload list friend requests
	useEffect(() => {
		//console.log("Friend Request reloaded!")
		if (DataUser.id === ReloadFriendRequestlist.user_id)
		{
			axios.get("http://localhost:8080/relationship/me/list?status=notconfirmed", {withCredentials: true,})
			.then(res => {
				SetFriendRequests(res.data);
			})
			.catch(res => {
				console.log(`error: ${res}`);
			})
		}
	}, [ReloadFriendRequestlist]);

	function FriendRequest(FriendRequest: IFriendRequest)
	{
		return (
			<div key={`FriendRequest_${FriendRequest.user_id}`} className="FriendRequest UserButton">
				<Row>
				<Col lg={3}>
				<Image src={FriendRequest.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
				</Col>
				<Col lg={4}>
				<div style={{margin:"1em"}}> {FriendRequest.user_nickname} </div>	
				</Col>
				<Col lg={5}>
					<Image className="ValidationButton" src={ApprovedButton} rounded onClick={() => ValidationFriend(FriendRequest.relation_id, true, ReloadComponent) }/>
					<Image className="ValidationButton" src={DeclineButton} rounded onClick={() => ValidationFriend(FriendRequest.relation_id, false, ReloadComponent) }/>
				</Col>
			</Row>
			</div>
		)
		//console.log(`FriendRequest : ${FriendRequest}`)
	}

	return (
		<div className="ScrollingListMembers">
			{FriendRequests.map(FriendRequest)}
			{/*<Button onClick={() => SetReloadFriendRequestlist(!ReloadFriendRequestlist)}> Reload FriendRequests
			</Button>*/}
		</div>
	)
}
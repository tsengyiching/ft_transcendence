import { useState, useEffect } from "react"
import { socket } from "../../context/socket";
import {Image, Button} from 'react-bootstrap'
import axios from 'axios'
import "./ListFriends.css"
import './members.css'
import status from './Status'

interface IFriend {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: 'Available' | 'Playing' | 'Offline'}


function Friend(Friend: IFriend)
{
	return (
		<div key={`Friend_${Friend.user_id}`} className="Friend UserButton">
		<Image src={Friend.user_avatar} className="PictureUser" alt="picture" rounded fluid/>
		{Friend.user_nickname}
		{status(Friend.user_userStatus)}
		</div>
	)
	//console.log(`Friend : ${Friend}`)
}

export default function ListFriends()
{
	const [Friends, SetFriends] = useState<IFriend[]>([]);
	const [ReloadFriendlist, SetReloadFriendlist] = useState<boolean>(true);

	useEffect(() => {
		socket.on('reload-friendlist', () => {SetReloadFriendlist(true)});
	}, [])

	useEffect(() => {
		if (ReloadFriendlist === true)
		{
			axios.get("http://localhost:8080/relationship/me/list?status=friend", {withCredentials: true,})
			.then(res => {
				SetFriends(res.data);
			})
			.catch(res => {
				console.log("error");
			})
			console.log(Friends);
			SetReloadFriendlist(false);
		}
	}, [ReloadFriendlist]);

	return (
		<div className="ScrollingListFriends">
			{Friends.map(Friend)}
			{/*<Button onClick={() => SetReloadFriendlist(true)}> Reload Friends
			</Button>*/}
		</div>
	)
}
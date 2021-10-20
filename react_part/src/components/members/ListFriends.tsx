import { useState, useEffect } from "react"
import { socket } from "../../context/socket";
import axios from 'axios'
import "./ListFriends.css"

interface IFriend {
	user_id: number;
	user_nickname: string;
	user_avatar: string;
	user_userStatus: 'Available' | 'Playing' | 'Offline'}

	
function Friend(Friend: IFriend)
{
	return (
		<div key={`Friend_${Friend.user_id}`} className="Friend">
		{Friend.user_nickname}
	</div>
	)
	//console.log(`Friend : ${Friend}`)
}

export default function ListFriends()
{
	const [Friends, SetFriends] = useState<IFriend[]>([]);

	useEffect(() => {
		axios.get("http://localhost:8080/relationship/me/list?status=friend", {withCredentials: true,})
		.then(res => {
			SetFriends(res.data);
		})
		.catch(res => {
			console.log("error");
		})
	}, []);

	return (
		<div className="ScrollingListFriends">
			{Friends.map(Friend)}
		</div>
	)
}
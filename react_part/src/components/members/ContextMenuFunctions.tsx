
import axios from 'axios'
import { socket } from '../../context/socket';

export function InvitateToGame(id: number)
{
	console.log(`I invitate ${id} to play a game`);
}

/*
	Approve or Decline a friend invitation
	param: id: id of the user, isAccepted: does the user accept or decline the invitation
*/
export function ValidationFriend(id: number, isAccepted: boolean, CallBackfunction: () => void)
{
	if (isAccepted)
	{
		axios.get(`http://localhost:8080/relationship/accept/${id}`, {withCredentials: true,})
		.then(res => {CallBackfunction()})
		.catch(res => console.log(`error in ValidationFriend: ${res}`));
	}
	else
	{
		axios.delete(`http://localhost:8080/relationship/reject/${id}`, {withCredentials: true,})
		.then(res => CallBackfunction())
		.catch(res => console.log(`error in ValidationFriend: ${res}`));
	}
}

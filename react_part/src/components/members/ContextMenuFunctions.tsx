
import axios from 'axios'
import { socket } from '../../context/socket';

export function InvitateToGame(id: number)
{
	console.log(`I invitate ${id} to play a game`);
}

export function SpectateGame(id: number)
{
	console.log(`I spectate ${id} game`);
}

export function Unfriend(id: number)
{
	axios.delete('http://localhost:8080/relationship/unfriend', {withCredentials: true, data: {addresseUserId: id}});
}


/*
	Approve or Decline a friend invitation
	param: relationship_id: id of the request, isAccepted: does the user accept or decline the invitation
*/
export function ValidationFriend(relationship_id: number, isAccepted: boolean, CallBackfunction: () => void)
{
	if (isAccepted)
	{
		axios.get(`http://localhost:8080/relationship/accept/${relationship_id}`, {withCredentials: true,})
		.then(res => {CallBackfunction()})
		.catch(res => console.log(`error in ValidationFriend: ${res}`));
	}
	else
	{
		axios.delete(`http://localhost:8080/relationship/reject/${relationship_id}`, {withCredentials: true,})
		.then(res => CallBackfunction())
		.catch(res => console.log(`error in ValidationFriend: ${res}`));
	}
}

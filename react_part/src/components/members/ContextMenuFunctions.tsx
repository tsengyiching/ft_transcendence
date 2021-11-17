
import axios from 'axios'

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
	axios.delete('http://localhost:8080/relationship/unfriend', {withCredentials: true, data: {addresseeUserId: id}})
	.catch((res) => console.log(res));
}

export function Askfriend(id: number)
{
	axios.post('http://localhost:8080/relationship/add', {addresseeUserId: id}, {withCredentials: true})
}

export function Block(id: number)
{
	axios.post('http://localhost:8080/relationship/block', {addresseeUserId: id}, {withCredentials: true})
}

export function Unblock(id: number)
{
	axios.delete('http://localhost:8080/relationship/unblock', {withCredentials: true, data: {addresseeUserId: id}})
}

/*
	Approve or Decline a friend invitation
	param: relationship_id: id of the request, isAccepted: does the user accept or decline the invitation
*/
export function ValidationFriend(relationship_id: number, isAccepted: boolean, CallBackfunction: () => void)
{
	if (isAccepted)
	{
		axios.patch(`http://localhost:8080/relationship/accept/${relationship_id}`, {}, {withCredentials: true,})
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

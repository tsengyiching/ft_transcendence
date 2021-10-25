
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
export function ValidationFriend(id: number, isAccepted: boolean)
{
	if (isAccepted)
	{
		axios({
			method: 'patch',
			url: `http://localhost:8080/relationship/accept/${id}`,
		      })
		.then(res => socket.emit('reload-friend-requests'))
		.catch(res => console.log(`error in ValidationFriend: ${res}`));
	}
	else
	{
		axios({
			method: 'patch',
			url: `http://localhost:8080/relationship/decline/${id}`,
		      })
		.then(res => socket.emit('reload-friend-requests'))
		.catch(res => console.log(`error in ValidationFriend: ${res}`));

	}
}

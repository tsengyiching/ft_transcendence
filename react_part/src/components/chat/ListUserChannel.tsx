
import {Button} from 'react-bootstrap'
import { ContextMenuTrigger, ContextMenu, MenuItem} from 'react-contextmenu'
import { useHistory } from 'react-router'
import {useState, useContext} from 'react'
import {socket, SocketContext} from '../../context/socket'
import {DataContext, Data} from '../../App'
import {Modal} from 'react-bootstrap'
import {IUser} from './ChatInterface'
import {Role} from './InterfaceUser'

interface IPropsModal {
	show: boolean,
	onHide: () => void,
	backdrop: string,
	sanctionstatus: 'mute' | 'ban',
	user: IUser | undefined,
      }

export default function ListChannelUser(props: {ListUsers: IUser[], myrole: Role, channelId: number,})
{
	function ContextMenuChannelUser(props: {
		user: IUser,
		myrole: Role,
		channelId: number,
		ShowModal: () => void,
		SetMute: () => void,
		SetBan: () => void,
		SetUser: (user: IUser) => (void)})
	{
		if (props.user === undefined)
			return(<div></div>);

		const Mygrade = props.myrole === 'Owner' ? 3 : props.myrole === 'Admin' ? 2 : 1;
		const Usergrade = props.user.role === 'Owner' ? 3 : props.user.role === 'Admin' ? 2 : 1;

		return (<div>
			{props.user.user_id === userData.id ?
				<ContextMenu id={`ContextMenuChannelUser_${props.user.user_id}`}>
					<MenuItem onClick={() => history.push(`/profile/${props.user.user_id}`)}>
						View Profile
					</MenuItem>
				</ContextMenu>
			:
				<ContextMenu id={`ContextMenuChannelUser_${props.user.user_id}`}>
					<MenuItem onClick={() => history.push(`/profile/${props.user.user_id}`)}>
						View Profile
					</MenuItem>
					<MenuItem>
						Send a message
					</MenuItem>
					{ Mygrade > Usergrade &&
					<div>
					<MenuItem onClick={() => {props.SetMute(); props.SetUser(props.user); props.ShowModal()}}>
						Mute
					</MenuItem>
					<MenuItem onClick={() => {props.SetBan(); props.SetUser(props.user); props.ShowModal()}}>
						Ban
					</MenuItem>
					</div>}

					{ Mygrade === 3 && Usergrade === 1 &&
					<MenuItem onClick={() => {socket.emit("channel-admin", {channelId: props.channelId, participantId: props.user.user_id, action: 'Set'})}}>
						Promote Admin
					</MenuItem>
					}
					{ Mygrade === 3 && Usergrade === 2 &&
					<MenuItem onClick={() => {socket.emit("channel-admin", {channelId: props.channelId, participantId: props.user.user_id, action: 'Unset'})}}>
						Demote to User
					</MenuItem>
					}
				</ContextMenu>
			}
			</div>
			)
	}
	
	function ChannelUser(props: {user: IUser, myrole: Role, channelId: number})
	{
		const [ViewModal, SetViewModal] = useState(false);		
		const onHide = () => SetViewModal(false);
		const ShowModal = () => SetViewModal(true);

		const [SanctionStatus, SetSanctionStatus] = useState<'mute' | 'ban'>('mute');
		const SetMute = () => SetSanctionStatus('mute');
		const SetBan = () => SetSanctionStatus('ban');

		const [UserModal, SetUserModal] = useState<undefined | IUser>(undefined);
		const SetUser = (user: IUser) => SetUserModal(user);

		return(
			<div>
				<ContextMenuTrigger id={`ContextMenuChannelUser_${props.user.user_id}`}>
					<Button disabled style={{width: "80%", margin: "0.5%"}}>
						{props.user.user_nickname}
					</Button>
				</ContextMenuTrigger>
				<ContextMenuChannelUser
				{...props}
				ShowModal={ShowModal}
				SetMute={SetMute}
				SetBan={SetBan}
				SetUser={SetUser}
				/>
				<SanctionModal
					show={ViewModal}
					onHide={onHide}
					backdrop="static"
					sanctionstatus={SanctionStatus}
					user={UserModal}
				/>
			</div>
		)
	}

	let history = useHistory();
	const userData = useContext(DataContext);
	const socket = useContext(SocketContext);

	return (
		<div className="overflow-auto" style={{marginTop: "15%"}}>
			{props.ListUsers.map((User: IUser) => <ChannelUser key={`channel_user_${User.user_id}`} user={User} myrole={props.myrole} channelId={props.channelId}/> )}
		</div>
	)
}

function SanctionModal(props: IPropsModal)
{
	function SubmitForm(event: any)
	{
		event.preventDefault();
	}

	if (props.user === undefined)
		return (<div></div>);
	return (
		<Modal
		{...props}
		aria-labelledby="contained-modal-title-vcenter"
		centered
		style={{color:"black"}}>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					How long do you want to {props.sanctionstatus} {props.user.user_nickname} ?
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>

			</Modal.Body>
		</Modal>
	)
}
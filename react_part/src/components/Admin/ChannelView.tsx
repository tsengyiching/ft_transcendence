import { useContext, useEffect, useState } from 'react'
import {Col, Row, Form, Button} from 'react-bootstrap'
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu';
import { socket, SocketContext } from '../../context/socket';
import { ListChannelMessage } from '../chat/Channel/ChatChannel';
import {IMyChannel, IOtherChannel} from '../chat/Channel/ListChannel'
import {IMessage, IUser} from '../chat/ChatInterface'

interface IChannel
{
	channel_id: number,
	channel_name: string,
}

function ListChannel(props: {setChannelSelected: Function})
{
	let socket = useContext(SocketContext);
	const [ListChannel, setListChannel] = useState<IChannel[]>([]);
	const [MyChannels, setMyChannels] = useState<IChannel[]>([]);
	const [OtherChannels, setOtherChannels] = useState<IChannel[]>([]);

	useEffect(() => {
		socket.emit('ask-reload-channel');
	}, [socket])

	useEffect(() => {
		setListChannel(MyChannels.concat(OtherChannels));
		socket.on('channels-user-in', (data: IMyChannel[]) => {
			setMyChannels(data.map((Mychannel) => {
				let newChannel: IChannel = {channel_id: Mychannel.channel_id, channel_name: Mychannel.channel_name};
				return(newChannel);
			}));
		});
		socket.on('channels-user-out', (data: IOtherChannel[]) => {
			setOtherChannels(data.map((Otherchannel) => {
				let newChannel: IChannel = {channel_id: Otherchannel.channel_id, channel_name: Otherchannel.channel_name};
				return(newChannel);
			}));
		});

		return(() => {
			socket.off('channels-user-in');
			socket.off('channels-user-out');
		})
	}, [socket, MyChannels, OtherChannels,])

	return (
		<div>
			<Form>
			<Form.Select aria-label="Change Status Site"
				onChange={(e: any) => {
					props.setChannelSelected(ListChannel.find(element => {return(element.channel_id === Number(e.target.value))}))
				}}
				>
				<option value={undefined}> Select Channel </option>
				{ListChannel.map((Channel) => {return(
					<option key={`optionListChannel-${Channel.channel_id}`} value={Channel.channel_id}> {Channel.channel_name} </option>
				)})}
			</Form.Select>
			</Form>
		</div>
	)
}

function Messages(props: {ChannelSelected: IChannel | undefined})
{
	const [ListMessage, setListMessage] = useState<IMessage[]>([]);

	useEffect(() => {
		socket.on('channel-message-list', (data: IMessage[]) => {setListMessage(data)});

		return(() => {socket.off('channel-message-list');})
	}, [])

	useEffect(() => {
		socket.on('channel-new-message', (new_message: IMessage) => {
			const buffer = [...ListMessage];
			buffer.push(new_message);
			setListMessage(buffer);
		})
		return(() => {socket.off('channel-new-message');})
	}, [ListMessage])

	return (
		<div>
			Messages
			<ListChannelMessage ListMessage={ListMessage}/>
		</div>
	)
}

function UserButton(props: {user: IUser, channel: IChannel})
{
	return(
		<div>
		<ContextMenuTrigger id={`ContextMenuAdminViewUser_${props.user.user_id}`}>
			<Button key={`user-ChannelView-${props.user.user_id}`}> {props.user.user_nickname} </Button>
		</ContextMenuTrigger>
		{props.user.role !== 'Owner' &&
			<ContextMenu id={`ContextMenuAdminViewUser_${props.user.user_id}`}>
			{
				props.user.role === 'User' ?
				<MenuItem onClick={() => {socket.emit("channel-admin",
					{channelId: props.channel.channel_id,
					participantId: props.user.user_id,
					action: 'Set'})}}>
					Promote to Admin
				</MenuItem>
				: props.user.role === 'Admin' ?
				<MenuItem onClick={() => {socket.emit("channel-admin",
					{channelId: props.channel.channel_id,
					participantId: props.user.user_id,
					action: 'Unset'})}}>
					Demote to User
				</MenuItem>
				:
				<div></div>
			}
			</ContextMenu>
			}
		</div>
	)
}

function ListUsers(props: {ChannelSelected: IChannel | undefined})
{
	const [ListUser, setListUser] = useState<IUser[]>([]);
	let CurrentChannel : IChannel;
	if (props.ChannelSelected !== undefined)
		CurrentChannel = props.ChannelSelected;
	useEffect(() => {
		socket.on('channel-users', (data: IUser[]) => {setListUser(data);});

		return(() => {socket.off('channel-users');});
	}, [])

	return (
		<Row>
			List Users
			{props.ChannelSelected !== undefined &&
				ListUser.map((user: IUser) =>{return(
				<UserButton
				key={`UserAdminView${user.user_id}`}
				user={user}
				channel={CurrentChannel}/>
			)})}
		</Row>
	)
}

export default function ChannelView()
{
	const [ChannelSelected, setChannelSelected] = useState<IChannel | undefined>(undefined);

	useEffect(() => {
		const CurrentChannel = ChannelSelected;
		if (ChannelSelected !== undefined)
			socket.emit('channel-load', ChannelSelected.channel_id);
		return(() => {
			if (CurrentChannel !== undefined)
				socket.emit('channel-unload', CurrentChannel.channel_id);});
	}, [ChannelSelected])

	return (
		<div>
			<Row>
				Channel Selected :
				<ListChannel setChannelSelected={setChannelSelected}/>
			</Row>
			<Row>
				<Col lg={8}>
					<Messages ChannelSelected={ChannelSelected} />
				</Col>
				<Col>
					<ListUsers ChannelSelected={ChannelSelected} />
				</Col>
			</Row>
		</div>
	)
}
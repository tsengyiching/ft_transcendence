import { useContext, useEffect, useState } from 'react'
import {Col, Row, Form} from 'react-bootstrap'
import { socket, SocketContext } from '../../context/socket';
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
		socket.on('channels-user-in', (data: IMyChannel[]) => {
			//console.log("in channels-user-in");
			//console.log(data);
			setMyChannels(data.map((Mychannel) => {
				let newChannel: IChannel = {channel_id: Mychannel.channel_id, channel_name: Mychannel.channel_name};
				return(newChannel);
			}));
			//console.log(MyChannels.concat(OtherChannels));
			//setListChannel(MyChannels.concat(OtherChannels));
		});
		socket.on('channels-user-out', (data: IOtherChannel[]) => {
			//console.log("in channels-user-out");
			//console.log(data);
			setOtherChannels(data.map((Otherchannel) => {
				let newChannel: IChannel = {channel_id: Otherchannel.channel_id, channel_name: Otherchannel.channel_name};
				return(newChannel);
			}));
			//console.log(MyChannels.concat(OtherChannels));
		});
		setListChannel(MyChannels.concat(OtherChannels));

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
	}, [ListMessage])

	return (
		<div>
			Messages
			{ListMessage.map((message: IMessage) => <div key={`message-channelview-${message.message_id}`}> {message.message_content} </div>)}
		</div>
	)
}

function ListUsers(props: {ChannelSelected: IChannel | undefined})
{
	const [ListUser, setListUser] = useState<IUser[]>([]);

	useEffect(() => {
		socket.on('channel-users', (data: IUser[]) => {setListUser(data);});

		return(() => {socket.off('channel-users');});
	}, [])

	return (
		<div>
			List Users
			{ListUser.map((user: IUser) =>{return(<div key={`user-ChannelView-${user.user_id}`}> {user.user_nickname} </div>)})}
		</div>
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
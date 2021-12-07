import { useContext, useEffect, useState } from 'react'
import {Col, Row} from 'react-bootstrap'
import { SocketContext } from '../../context/socket';
import {IMyChannel, IOtherChannel} from '../chat/Channel/ListChannel'

interface IChannel
{
	channel_id: number,
	channel_name: string,
}

function joinChannels(MyChannels: IMyChannel[], OtherChannels: IOtherChannel[])
{
	let NewList : IChannel[] = [];

	MyChannels.map((channel) => {
		NewList.push({channel_id: channel.channel_id, channel_name: channel.channel_name});
	})
	OtherChannels.map((channel) => {
		NewList.push()
	})
}

function ListChannel(setChannelSelected: any)
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
			console.log(data);
			setMyChannels(data.map((Mychannel) => {
				let newChannel: IChannel = {channel_id: Mychannel.channel_id, channel_name: Mychannel.channel_name};
				return(newChannel);
			}));
			console.log("My Channels : ");
			console.log(MyChannels);
			setListChannel(MyChannels.concat(OtherChannels));
			console.log("List Channel : ");
			console.log(MyChannels.concat(OtherChannels));
		});
		socket.on('channels-user-out', (data: IOtherChannel[]) => {
			setOtherChannels(data);
			console.log(OtherChannels);
		});

		return(() => {
			socket.off('channels-user-in');
			socket.off('channels-user-out');
		})
	}, [socket, ])

	return (
		<div>
			List Channel
		</div>
	)
}

function Messages(props: {ChannelSelected: IChannel | undefined})
{
	return (
		<div>
			Messages
		</div>
	)
}

function ListUsers(props: {ChannelSelected: IChannel | undefined})
{
	return (
		<div>
			List Users
		</div>
	)
}

export default function ChannelView()
{
	const [ChannelSelected, setChannelSelected] = useState<IChannel | undefined>(undefined);

	return (
		<div>
			<Row> <ListChannel setChannelSelected={setChannelSelected}/> </Row>
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
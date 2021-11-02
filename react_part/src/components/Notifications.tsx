import { useEffect, useState } from 'react';
import {Toast, ToastContainer, } from 'react-bootstrap'
import { socket } from '../context/socket';

type NotificationType = 'success' | 'warning' | 'error'

interface INotification
{
	type: NotificationType
	message: string,
}

function Notifications() {

	function ToastComponent(props: {Notification: INotification, idx: number})
	{
		return (
			<div key={`Toast_${props.idx}`}>
			<Toast bg={props.Notification.type} onClose={() => closeNotif(props.idx)}>
				<Toast.Header>
					<strong style={{width: "21em"}}> Notification </strong>
				</Toast.Header>
				<Toast.Body>
					{`${props.Notification.message}`}
				</Toast.Body>
			</Toast>
			</div>
		)
	}

	const [NotificationList, SetNotifications] = useState<INotification[]>([]);

	function closeNotif(idx: number)
	{
		NotificationList.splice(idx, 1);
		SetNotifications([...NotificationList]);
	}

	useEffect(() =>
	{
		socket.on('alert', (data: {alert: INotification}) => {
			NotificationList.push(data.alert);
			SetNotifications([...NotificationList]);
		});
		//console.log(`NotificationList changed!`);
		//console.log(NotificationList);
		return (() => {socket.off('alert')})
	}, [NotificationList]);

/* 	const successnotif: INotification = {type: 'success', message: 'bonjour a tous'}
	const [compt, setcompt] = useState(0); */
    return (
 	<div style={{zIndex:2}}>

	<ToastContainer position='top-start' className='ToastList'>
	{
		NotificationList.map((Notification, idx) => ToastComponent({Notification, idx}))
	}
	</ToastContainer>
 {/* 	<Button onClick={ () => {
		console.log('click');
		successnotif.message = `message : ${compt}`;
		successnotif.type = 'warning';
		setcompt(compt + 1);
		NotificationList.push(successnotif);
		let newlist: INotification[] = [...NotificationList]
		SetNotifications(newlist);
	}}> Create a notif </Button> */}
	</div>
    )

}

export default Notifications;
import ParametersIcon from '../pictures/parameters-icon.png'
import { Row, Col, Image, Modal, Form, Button, CloseButton} from 'react-bootstrap'
import {IChannel, } from './InterfaceUser'
import { useEffect, useState } from 'react'
import { socket } from '../../context/socket';

interface Props {
	show: boolean,
	onHide: () => void,
	backdrop: string,
	channel: IChannel,
      }

export default function ParametersChannel(channelselected: IChannel)
{
	const [modalShow, setModalShow] = useState(false);

	return (
	<Row>
	<Col lg={11}>
		<h2 style={{height:"1.2em"}}>
		{channelselected.channel_name}
		</h2>
	</Col>
	<Col>
		{channelselected.role === "Owner" ?
		<Image className="iconParameters" roundedCircle src={ParametersIcon} onClick={() => {setModalShow(true)}} />
		: <Image className="iconParameters" roundedCircle src={ParametersIcon}/>}
		<ModalParameters 
		show={modalShow}
		onHide={() => setModalShow(false)}
		backdrop="static"
		channel={channelselected}
		/>
	</Col>
	</Row>)
}

function ModalParameters(props: Props)
{
	const [newType, SetType] = useState<string>("");
	const [password, SetPassword] = useState("");

	useEffect(() => {
		SetType("Public");
		SetPassword("");
	}, [props.onHide])

	function ChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
		if (!newType)
		  SetPassword("");
		else
		  SetPassword(e.currentTarget.value);
	}

	function onHide(){
		props.onHide();
	      }

	function SubmitForm(event: any) {
		event.preventDefault();
		let action :string = "";
		if (props.channel.channel_type === "Public" && newType === "Private")
			action = "Add";
		else if (props.channel.channel_type === "Private" && newType === "Private")
			action = "Change";
		else
			action = "Remove";
		console.log({channelId: props.channel.channel_id, action: action, password: password});
		if (action !== "Remove")
			socket.emit("channel-change-password", {channelId: props.channel.channel_id, action: action, password: password});
		else
			socket.emit("channel-change-password", {channelId: props.channel.channel_id, action: action, password: null});
		onHide();
	      }

	return (
		<Modal
		{...props}
		size="lg"
		aria-labelledby="contained-modal-title-vcenter"
		centered
		>
			<Modal.Header closeButton>
				Type Channel
			</Modal.Header>
			<Modal.Body>
			<Form>
				<Form.Check className="mb-3" type="radio" label="Public" checked={newType === "Public"} onChange={() => {SetType("Public");}}>
				</Form.Check>
				<Form.Check type="radio" label="Private" checked={newType === "Private"} onChange={() => {SetType("Private");}} >
				</Form.Check>
				{
					newType &&
					<Form.Control required type="password" className="mb-3"
					value={password} name="newPassword" placeholder="New Password" onChange={ChangePassword}/>
				}
			</Form>
			<Modal.Footer>
				<Button variant="primary" onClick={SubmitForm} >
					Change
				</Button>
				<Button variant="secondary" onClick={onHide}>
					Cancel
				</Button>
			</Modal.Footer>
			</Modal.Body>
		</Modal>
	)
}
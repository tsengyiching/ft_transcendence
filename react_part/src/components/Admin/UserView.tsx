import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Form, Col, Row, Button, Image, Modal} from "react-bootstrap";
import { Data, } from "../../App";
import { SocketContext } from "../../context/socket";

enum SiteStatus {
	OWNER = 'Owner',
	MODERATOR = 'Moderator',
	USER = 'User',
	BANNED = 'Banned',
}

interface IPropsModal {
	show: boolean,
	onHide: () => void,
	backdrop: string,
	newstatus: SiteStatus | undefined,
	user: Data | undefined,
}

function UserButton(props: {userData: Data, setSiteStatus: any, setSiteUser: any, setViewModal: any})
{
	let newSiteStatus : undefined | SiteStatus = undefined;

	return(
		<Row style={{backgroundColor: 'blueviolet', borderStyle: 'solid', borderWidth: '0.01em'}}>
			<Col ><Image src={props.userData.avatar} fluid style={{height: '3em'}}></Image></Col>
			<Col>{props.userData.nickname}</Col>
			<Col>{props.userData.siteStatus}</Col>
			<Col>
			{ 	props.userData.siteStatus !== SiteStatus.OWNER &&
				<div>
				<Form>
				<Form.Select aria-label="Change Status Site"
					onChange={(e: any) => {newSiteStatus = e.target.value}}
					>
					<option value={undefined}> Change Status Site </option>
					{props.userData.siteStatus !== SiteStatus.MODERATOR && <option value={SiteStatus.MODERATOR}>Set to Moderator </option>}
					{props.userData.siteStatus !== SiteStatus.USER && <option value={SiteStatus.USER}>Set to Normal User</option>}
					{props.userData.siteStatus !== SiteStatus.BANNED && <option value={SiteStatus.BANNED}>Set to Banned</option>}
				</Form.Select>
				</Form>
				<Button
				onClick={() => {
					if(newSiteStatus !== undefined)
					{
						props.setSiteStatus(newSiteStatus);
						props.setSiteUser(props.userData);
						props.setViewModal(true);
					}
				}}>
					Validate
				</Button>
				</div>
			}
			</Col>
		</Row>
	)
}

function UserModal(props: IPropsModal)
{
	function SubmitForm(event: any) {
		event.preventDefault();
		if (props.user !== undefined)
		{
			axios.patch("http://localhost:8080/admin/set", {id: props.user.id, newStatus: props.newstatus}, {withCredentials: true})
			.then((res) => onHide())
			.catch(res => console.log("error change site status : " + res.data));
		}
	}

	function onHide(){
		props.onHide();
	}

	return(
		<Modal
		{...props}
		size="lg"
		aria-labelledby="contained-modal-title-vcenter"
		centered
	      >
		<Modal.Header closeButton>
		  <Modal.Title id="contained-modal-title-vcenter">
		{ props.user !== undefined &&
		    `Are you sure you want to pass ${props.user.nickname} to ${props.newstatus} status ?`}
		  </Modal.Title>
		</Modal.Header>
		<Modal.Footer>
			<Button variant="primary" onClick={SubmitForm}>
				Confirm
			</Button>
			<Button variant="secondary" onClick={onHide}>
				Cancel
			</Button>
		</Modal.Footer>
		</Modal>
	)
}

export default function UserView()
{
	const [listUser, setListUser] = useState<Data[]>([]);
	const [siteStatus, setSiteStatus] = useState<undefined | SiteStatus>(undefined);
	const [siteUser, setSiteUser] = useState<undefined | Data>(undefined);
	const [ReloadUserList, setReloadUserList] = useState<number>(0);
	const socket = useContext(SocketContext);

	const [ViewModal, SetViewModal] = useState(false);
	const onHide = () => SetViewModal(false);

	useEffect(() => {
		let isMounted = true;
		axios.get('http://localhost:8080/profile/all', {withCredentials: true,})
		.then(res => {
			if (isMounted)
				setListUser(res.data);
		})
		.catch(res => {
			if (isMounted)
				console.log(`error get admin list : ${res.data}`);
		})
		socket.on('reload-users', () => {setReloadUserList(ReloadUserList + 1);})
		return(() => {
			isMounted = false;
			socket.off('reload-users');
		});
	}, [ReloadUserList, socket])

	return (
		<div style={{overflow: 'auto', backgroundColor: 'grey', height: '70em', fontSize: '2em'}}>
			{ listUser.map((user) =>
			(<UserButton
			userData={user}
			setSiteStatus={setSiteStatus}
			setSiteUser={setSiteUser}
			setViewModal={SetViewModal}
			key={`user-view-${user.id}`}
			/>)) }
		<UserModal
		show={ViewModal}
		onHide={onHide}
		backdrop="static"
		newstatus={siteStatus}
		user={siteUser}
		/>
		</div>
	)
}
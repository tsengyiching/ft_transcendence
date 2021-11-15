import ParametersIcon from '../pictures/parameters-icon.png'
import { Row, Col, Image, Modal} from 'react-bootstrap'
import {IChannel, } from './InterfaceUser'
import { useState } from 'react'

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
		<Image className="iconParameters" roundedCircle src={ParametersIcon} onClick={() => {setModalShow(true)}}/>
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
	const [isPrivate, SetisPrivate] = useState<boolean>(false);

	return (
		<Modal
		{...props}
		size="lg"
		aria-labelledby="contained-modal-title-vcenter"
		centered
		>
			<Modal.Header>
				Parameters Channel
			</Modal.Header>
			<Modal.Body>
			<form>
				<div className="radio">
					<label>
						<input type="radio" value="option1" checked={!isPrivate} onClick={() => SetisPrivate(false)}/>
						Public
					</label>
				</div>
					<div className="radio">
					<label>
						<input type="radio" value="option2" checked={isPrivate} onClick={() => SetisPrivate(true)}/>
						Private
					</label>
				</div>
			</form>
			</Modal.Body>
		</Modal>
	)
}
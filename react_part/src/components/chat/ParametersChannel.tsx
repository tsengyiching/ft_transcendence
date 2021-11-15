import ParametersIcon from '../pictures/parameters-icon.png'
import { Row, Col, Image, Modal} from 'react-bootstrap'
import {IChannel, } from './InterfaceUser'

interface Props {
	show: boolean,
	onHide: () => void,
	backdrop: string,
	channel: IChannel,
      }

export default function ParametersChannel(channelselected: IChannel)
{
	return (
	<Row>
	<Col lg={11}>
		<h2 style={{height:"1.2em"}}>
		{channelselected.channel_name}
		</h2>
	</Col>
	<Col>
		<Image className="iconParameters" roundedCircle src={ParametersIcon} onClick={() => {console.log("setting")}}/>
	</Col>
	</Row>)
}

function ModalParameters()
{
	return (
		<Modal>

		</Modal>
	)
}
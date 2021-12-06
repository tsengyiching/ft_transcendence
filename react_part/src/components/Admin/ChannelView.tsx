import {Col, Row} from 'react-bootstrap'

export default function ChannelView()
{
	return (
		<div>
			<Row> List Channel </Row>
			<Row>
				<Col lg={8}>
					Messages
				</Col>
				<Col>
					List Users
				</Col>
			</Row>
		</div>
	)
}
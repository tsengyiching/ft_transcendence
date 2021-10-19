
import { Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState} from 'react'
import './members.css'
import Friends from './Friends'

export default function Members()
{
    const [radioMembersValue, setMembersRadioValue] = useState('1');
    const membersradios = [
        {name: 'Friends', value: '1'},
        {name: 'Users', value: '2'},
    ]
    return (
		<div>
		    <ButtonGroup className="mb-2">
			{membersradios.map((radio, idx) => (
			    <ToggleButton
			    id={`membersRadio-${idx}`}
			    name="membersRadio"
			    key={idx % 2 ? 'friends' : 'users'}
			    type='radio'
			    variant={idx % 2 ? 'outline-danger' : 'outline-primary'}
			    value={radio.value}
			    checked={radioMembersValue === radio.value}
			    onChange={(e) => setMembersRadioValue(e.currentTarget.value)}
			    >
				{radio.name}
			    </ToggleButton>
			))}
		    </ButtonGroup>
		    {radioMembersValue === '1' ? <Col> Friends</Col> : <Col> Users </Col>}
		</div>
	)
}

import { Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState} from 'react'
import './members.css'
import ListFriends from './ListFriends'

export default function Members()
{
    const [radioMembersValue, setMembersRadioValue] = useState('1');
    const membersradios = [
        {name: 'Friends', value: '1', variant: 'outline-primary'},
        {name: 'Users', value: '2', variant: 'outline-secondary'},
	{name: 'Blocked', value: '3', variant: 'outline-danger'},
	{name: 'Friend Requests', value: '4', variant: 'outline-warning'}
    ]
    return (
		<div>
		    <ButtonGroup className="mb-2">
			{membersradios.map((radio, idx) => (
			    /*<ToggleButton
			    size="lg"
			    id={`membersRadio-${idx}`}
			    name="membersRadio"
			    key={radio.name}
			    type='radio'
			    variant={radio.variant}
			    value={radio.value}
			    checked={radioMembersValue === radio.value}
			    onChange={(e) => setMembersRadioValue(e.currentTarget.value)}
			    >
				{radio.name}
			    </ToggleButton>*/
			    <button 
				id={`membersRadio-${idx}`}
			    	key={radio.name}
				style={{width: '300px'}}
				>
				    {radio.name}
			    </button>
			))}
		    </ButtonGroup>
		    { radioMembersValue === '1' ? <ListFriends/>
		    : radioMembersValue === '2' ? <Col> Users </Col>
		    : radioMembersValue === '3' ? <Col> Blocked </Col>
		    : 				  <Col> Friend Requests </Col>}
		</div>
	)
}
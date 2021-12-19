import { Form, Button, Alert } from 'react-bootstrap'
import { useState } from 'react'

import axios from 'axios';

export const ChangeNickName = () => {
    const [nickname, setNickname] = useState("");
    const [alert, setAlert] = useState(0);

    function modifyNickname () {
        axios.patch('http://' + process.env.REACT_APP_DOMAIN_BACKEND + '/profile/name/',{nickname: nickname},
        {withCredentials:true,
        })
        .then(res => {
            setAlert(0)
            window.location.reload();
        })
        .catch(res => {
            setAlert(1)
        })
    }

    function SubmitNickname(event: any) {
        event.preventDefault();
        modifyNickname();
    }

    function changeNickName(e: React.ChangeEvent<HTMLInputElement>) { setNickname(e.currentTarget.value);}

    function showAlert () {
        if (alert === 1)
        return (
			<Alert variant={'danger'}>
					The inserted nickname is invalid
			</Alert>
        )
    }

    return (
		<Form onSubmit={SubmitNickname} >
			<h4>Change nickname</h4>
			{showAlert()}
			<Form.Group className="mb-3">
				<Form.Control type="text" value={nickname} name="nickname" placeholder="Enter your new nickname" onChange={changeNickName} />
			</Form.Group>

			<Button variant="primary" type="submit">Submit</Button>
		</Form>
    );
}
import { Form, Button, Image, Alert } from 'react-bootstrap'
import { useState } from 'react'

import axios from 'axios';
import { decodedTextSpanIntersectsWith } from 'typescript';

export const ChangeNickName = ({}) => {
    const [nickname, setNickname] = useState("");
    const [alert, setAlert] = useState(0);

    function modifyNickname () {
        axios.patch('http://localhost:8080/profile/name/',{nickname: nickname},
        {withCredentials:true,
        })
        .then(res => {
            setAlert(0)
            window.location.reload();
        })
        .catch(res => {
            setAlert(1)
            console.log("Erreur")
        })
    }

    function SubmitNickname(event: any) {
        event.preventDefault();
        modifyNickname();
    }

    function changeNickName(e: React.ChangeEvent<HTMLInputElement>) { setNickname(e.currentTarget.value);}

    function showAlert () {
        if (alert == 1)
        return (
            <div>
                <Alert variant={'danger'}>
                        The inserted nickname is invalid
                </Alert>
            </div>
        )
    }

    return (
        <div>
            <h4>Change nickname : </h4>
            <Form className="" onSubmit={SubmitNickname} >
            <Form.Control type="text" value={nickname} name="nickname" placeholder="Enter your new nickname" onChange={changeNickName} />
                <Button variant="success" type="submit">
                    submit
                </Button>
            </Form>
            {showAlert()}
        </div>
    )
}
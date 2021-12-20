import { Form, Button, Alert } from 'react-bootstrap'
import React, { useState, useCallback } from 'react'
import axios from 'axios';

interface STATE {
    setConnection:Function;
    //isConnected:boolean;
}

const Twofa = (props:STATE) => {
    const [code, setCode] = useState("")
    const [alert, setAlert] = useState(0);
    const setConnection = props.setConnection;

    const SubmitCode = useCallback(
        async (event) => {
        event.preventDefault();
        await axios.post('http://' + process.env.REACT_APP_DOMAIN_BACKEND + '/2fa/authenticate',{twoFactorAuthenticationCode: code},
            {withCredentials:true,
        })
        .then(res => {
            setAlert(0)
            setConnection(true);
            window.location.reload();
        })
        .catch(res => {
            setAlert(1)
        })
    }, [code, setConnection, ]);


    function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}

    function showAlert () {
        if (alert === 1)
            return (
                <div>
                    <Alert variant={'danger'}>
                        2FA code invalid
                    </Alert>
                </div>
            )
    }

    return (
        <div>
            <Form onSubmit={SubmitCode} >
            <Form.Control type="code" value={code} name="code" placeholder="Enter the 6 digits code" onChange={ChangeCode} />
                <Button variant="success" type="submit">
                    activate
                </Button>
            </Form>
            {showAlert()}
        </div>
    )
}

export default Twofa;
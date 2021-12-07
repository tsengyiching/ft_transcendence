import { Form, Button, Image, Alert } from 'react-bootstrap'
import { useState } from 'react'

import axios from 'axios';

export const ChangeTwoFA = () => {

    const [printQR, setPrintQR] = useState(0)
    const [code, setCode] = useState("")
    const [alert, setAlert] = useState(0);

    function turnOn() {
        axios.post('http://localhost:8080/2fa/turn-on/',{twoFactorAuthenticationCode: code},
            {withCredentials:true,
        })
        .then(res => {
            setAlert(0)
            window.location.reload();
        })
        .catch(res => {
            setAlert(2)
        })
    }

    function twoFactorAuth() {
        if (printQR !== 1) {
            axios.defaults.withCredentials = true;
            axios.get('http://localhost:8080/2fa/generate/', {
                withCredentials:true,
            })
            .then(res => {
                setPrintQR(1);
                setAlert(0)
            })
            .catch(res => {
                setAlert(1)
            })
        }
    }

    function SubmitCode(event: any) {
        event.preventDefault();
        turnOn();
    }

    function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}

    function showAlert () {
        if (alert === 1)
        return (
            <div>
                <Alert variant={'danger'}>
                        The 2FA code is already activated on this account
                </Alert>
            </div>
        )
    }

    function showAlert2 () {
        if (alert === 2)
        return (
            <div>
                <Alert variant={'danger'}>
                        2FA code invalid
                </Alert>
            </div>
        )
    }

    function PrintQRCode () {
        if (printQR) {
            return (
                <div>
                    <Image src="http://localhost:8080/2fa/generate/"/>
                    <Form className="" onSubmit={SubmitCode} >
                    <Form.Control type="code" value={code} name="code" placeholder="Enter the 6 digits code" onChange={ChangeCode} />
                        <Button variant="success" type="submit">
                            activate
                        </Button>
                        {showAlert2()}
                    </Form>
                </div>
            )
        }
    }

    return (
        <div>
            <h4>Activate 2FA : </h4>
            <Button onClick={twoFactorAuth} type="submit">activate</Button>
            {showAlert()}
            {PrintQRCode()}
        </div>
    )
}
import { Form, Button, Image } from 'react-bootstrap'
import React, { useState, useCallback } from 'react'
import axios from 'axios';
import { useHistory } from "react-router-dom";

interface STATE {
    setConnection:Function;
    isConnected:boolean;
}

const Twofa:JSX.Element = (props:STATE) => {
    const [code, setCode] = useState("")

    let history = useHistory();

    const authenticate() = useCallback(
        async (event: React.FormEvent<HTMLInputElement>) => {
        event.preventDefault();

        await axios.post('http://localhost:8080/2fa/authenticate/',{twoFactorAuthenticationCode: code},
            {withCredentials:true,
        })
        .then(res => {
            props.setConnection(true);
        })
        .catch(res => {
            console.log(res)
        })
    }, []);


    function SubmitCode(event: any) {
        authenticate();
    }

    function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}

    return (
        <div>
            <Form className="" onSubmit={SubmitCode} >
            <Form.Control type="code" value={code} name="code" placeholder="Enter the 6 digits code" onChange={ChangeCode} />
                <Button variant="success" type="submit">
                    activate
                </Button>
            </Form>
        </div>
    )
}

export default Twofa;
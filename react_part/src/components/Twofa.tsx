import { Form, Button, Image } from 'react-bootstrap'
import React, { useState, useCallback } from 'react'
import axios from 'axios';
import { useHistory } from "react-router-dom";

interface STATE {
    setConnection:Function;
    //isConnected:boolean;
}

const Twofa = (props:STATE) => {
    const [code, setCode] = useState("")
    const setConnection = props.setConnection;

    const SubmitCode = useCallback(
        async (event) => {
        event.preventDefault();

        await axios.post('http://localhost:8080/2fa/authenticate/',{twoFactorAuthenticationCode: code},
            {withCredentials:true,
        })
        .then(res => {
            setConnection(true);
        })
        .catch(res => {
            console.log(res)
        })
    }, []);


  
    function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}

    return (
        <div>
            <Form onSubmit={SubmitCode} >
            <Form.Control type="code" value={code} name="code" placeholder="Enter the 6 digits code" onChange={ChangeCode} />
                <Button variant="success" type="submit">
                    activate
                </Button>
            </Form>
        </div>
    )
}

export default Twofa;
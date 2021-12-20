import { Form, Button, Alert } from 'react-bootstrap'
import { useHistory } from "react-router-dom";
import React, { useState, useCallback } from 'react'
import axios from 'axios';

interface STATE {
    setConnection:Function;
    //isConnected:boolean;
}

const Twofa = (props:STATE) => {
    const [code, setCode] = useState("")
    const [alert, setAlert] = useState(0);
    const [msg, setMsg] = useState([])
    const setConnection = props.setConnection;
    let history = useHistory();

    const SubmitCode = useCallback(
        async (event) => {
        event.preventDefault();
        await axios.post('http://' + process.env.REACT_APP_DOMAIN_BACKEND + '/2fa/authenticate',{twoFactorAuthenticationCode: code},
            {withCredentials:true,
        })
        .then(res => {
            setAlert(0)
            setConnection(1);
            window.location.reload();
        })
        .catch(res => {
            //console.log(res.response.data.message)
            if (res.response.status === 403 && res.response.data.message === "User is banned by the site.")
                    history.push("/ban");
            else {
                setMsg(res.response.data.message)
                setAlert(1)
            }
        })
    }, [code, setConnection, ]);


    function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}

    function showAlert () {
        let items = []

        if (alert === 1){
            if (msg.length <= 2) {
                for(let i = 0; i < msg.length; i++) {
                    items.push(<Alert key={i} variant={'danger'}> {msg[i]} </Alert>)
                }
                return (
                    <div>
                        {items}
                    </div>
                )
            }
            else {
                return (
                    <div>
                        <Alert variant={'danger'}> {msg} </Alert>
                    </div>
                )
            }
        }
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
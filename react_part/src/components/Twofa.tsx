import { Form, Button, Image } from 'react-bootstrap'
import { useState } from 'react'
import axios from 'axios';
import { useHistory } from "react-router-dom";

function Twofa () {
    const [code, setCode] = useState("")

    let history = useHistory();

    function authenticate() {
        axios.post('http://localhost:8080/2fa/authenticate/',{twoFactorAuthenticationCode: code},
            {withCredentials:true,
        })
        .then(res => {
            history.push("/accueil");
        })
        .catch(res => {
            console.log(res)
        })
    }

    function SubmitCode(event: any) {
        event.preventDefault();
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
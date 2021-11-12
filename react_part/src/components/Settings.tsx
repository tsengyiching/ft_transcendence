import { useState } from 'react'
import { Form, Button, Image } from 'react-bootstrap'
import axios from 'axios';

function Parametre () {

    const [nickname, setNickname] = useState("");
    const [image, setImage] = useState("");
    const [qrCode, setQRCode] = useState("")
    const [printQR, setPrintQR] = useState(0)

    function modifyNickname() {
        axios.patch('http://localhost:8080/profile/name/',{nickname: nickname},
            {withCredentials:true,
        })
        .then(res => {
            console.log(res)
        })
        .catch(res => {
            console.log(res)
        })
    }

    function modifyImage() {
        axios.patch('http://localhost:8080/profile/avatar/', {avatar: image}, 
            {withCredentials:true,
        })
        .then(res => {
            console.log(res)
        })
        .catch(res => {
            console.log(res)
        })
    }

    function twoFactorAuth() {
        axios.defaults.withCredentials = true;
        axios.post('http://localhost:8080/2fa/generate/', {
            withCredentials:true,
        })
        .then(res => {
            setQRCode(res.data)
            setPrintQR(1);
        })
        .catch(res => {
            console.log(res)
        })
    }

    function SubmitNickname(event: any) {
        event.preventDefault();
        modifyNickname();
    }

    function SubmitImage(event: any) {
        event.preventDefault();
        modifyImage();
    }

    function PrintQRCode () {
        if (printQR) {
            return (
                <div>
                    <Image src={`${qrCode}`} width="100"/>
                </div>
            )
        }
    }

    function ChangeNickname(e: React.ChangeEvent<HTMLInputElement>) { setNickname(e.currentTarget.value);}
    function ChangeImage(e: React.ChangeEvent<HTMLInputElement>) { setImage(e.currentTarget.value);}

    return (
        <div>
            <div className="row">
                <div className="col">
                    <div className="row">
                        <div className="row w-50 p-3">
                            <h4>Change nickname : </h4>
                            <Form className="" onSubmit={SubmitNickname} >
                            <Form.Control type="text" value={nickname} name="nickname" placeholder="Enter your new nickname" onChange={ChangeNickname} />
                                <Button variant="success" type="submit">
                                    submit
                                </Button>
                            </Form>
                        </div>
                        <div className="row w-50 p-3">
                            <h4>Change profile picture : </h4>
                            <Form className="" onSubmit={SubmitImage} >
                            <Form.Control type="text" value={image} name="image" placeholder="Enter your new image" onChange={ChangeImage} />
                                <Button variant="success" type="submit">
                                    submit
                                </Button>
                            </Form>
                        </div>
                        <div className="row w-50 p-3">
                            <h4>Activate 2FA : </h4>
                            <Button onClick={twoFactorAuth} type="submit">submit</Button>
                            {PrintQRCode()}
                        </div>
                    </div>
                </div>
                <div className="col">
                </div>
            </div>
        </div>
    )
}

export default Parametre;
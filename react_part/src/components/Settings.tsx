import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import axios from 'axios';

function Parametre () {

    const [nickname, setNickname] = useState("");
    const [image, setImage] = useState("");

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

    function SubmitNickname(event: any) {
        event.preventDefault();
        modifyNickname();
    }

    function SubmitImage(event: any) {
        event.preventDefault();
        modifyImage();
    }

    function ChangeNickname(e: React.ChangeEvent<HTMLInputElement>) { setNickname(e.currentTarget.value);}
    function ChangeImage(e: React.ChangeEvent<HTMLInputElement>) { setImage(e.currentTarget.value);}

    return (
        <div>
            <div className="row">
                <div className="col">
                    <div className="row">
                        <div className="row w-50 p-3">
                            <h4>Changer de pseudo : </h4>
                            <Form className="" onSubmit={SubmitNickname} >
                            <Form.Control type="text" value={nickname} name="nickname" placeholder="Enter your new nickname" onChange={ChangeNickname} />
                                <Button variant="success" type="submit">
                                    valider
                                </Button>
                            </Form>
                        </div>
                        <div className="row w-50 p-3">
                            <h4>Changer de photo : </h4>
                            <Form className="" onSubmit={SubmitImage} >
                            <Form.Control type="text" value={image} name="image" placeholder="Enter your new image" onChange={ChangeImage} />
                                <Button variant="success" type="submit">
                                    valider
                                </Button>
                            </Form>
                        </div>
                        <div className="row w-50 p-3">
                            <h4>Activer le double authentificateur : </h4>
                            <Form className="w-25 p-3">
                                <Button type="submit">activer</Button>
                            </Form>
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
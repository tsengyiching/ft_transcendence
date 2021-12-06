import { useState } from 'react'
import { Form, Button, Image } from 'react-bootstrap'
import axios from 'axios';

function Parametre () {

    const [nickname, setNickname] = useState("");
    const [image, setImage] = useState("");
    const [printQR, setPrintQR] = useState(0)
    const [code, setCode] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)

    const handleImageChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;
    
        if (!fileList)
            return;
        setSelectedFile(fileList[0]);
      };

    const uploadFile = function (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        if (selectedFile === undefined)
            return ;
        const formData = new FormData();
        formData.append("file", selectedFile, selectedFile.name);
        axios.post('http://localhost:8080/profile/upload',
            formData,
            {withCredentials: true})
        .then(res => {
            setSelectedFile(undefined);
        })
        .catch(res => {
            console.log(res);
        });
    };

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
        if (printQR !== 1) {
            axios.defaults.withCredentials = true;
            axios.get('http://localhost:8080/2fa/generate/', {
                withCredentials:true,
            })
            .then(res => {
                setPrintQR(1);
            })
            .catch(res => {
                console.log(res)
            })
        }
    }

    function turnOn() {
        axios.post('http://localhost:8080/2fa/turn-on/',{twoFactorAuthenticationCode: code},
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

    function SubmitCode(event: any) {
        event.preventDefault();
        turnOn();
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
                    </Form>
                </div>
            )
        }
    }

    function ChangeNickname(e: React.ChangeEvent<HTMLInputElement>) { setNickname(e.currentTarget.value);}
    function ChangeImage(e: React.ChangeEvent<HTMLInputElement>) { setImage(e.currentTarget.value);}
    function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}

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
                            <label className="btn btn-default">
                                <input type="file" onChange={handleImageChange} />
                            </label>
                            <Button
                                className="btn btn-success"
                                disabled={!selectedFile}
                                onClick={uploadFile}
                                style={{width: "15%", marginLeft: "30%"}}
                            >
                                Upload
                            </Button>
{/*                             <Form>
                            <Form.Control type="file" name="image" placeholder="Enter your new image" onChange={handleImageChange} />
                                <Button variant="success" onClick={uploadFile}>
                                    submit
                                </Button>
                            </Form> */}
                        </div>
                        <div className="row w-50 p-3">
                            <h4>Activate 2FA : </h4>
                            <Button onClick={twoFactorAuth} type="submit">activate</Button>
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
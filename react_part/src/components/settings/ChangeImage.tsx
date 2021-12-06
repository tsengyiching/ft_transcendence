import { Form, Button, Image, Alert } from 'react-bootstrap'
import { useState } from 'react'

import axios from 'axios';

export const ChangeImage = ({}) => {
    const [alert, setAlert] = useState(0);
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
            setAlert(0)
            setSelectedFile(undefined);
            window.location.reload();
        })
        .catch(res => {
            setAlert(1)
        });
    };

    function showAlert () {
        if (alert == 1)
        return (
            <div>
                <Alert variant={'danger'}>
                    Image not acceptable
                </Alert>
            </div>
        )
    }

    return (
        <div>
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
            {showAlert()}
        </div>
    )
}
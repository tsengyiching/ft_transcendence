import React from 'react'
import "./Header.css"

import axios from 'axios';
import { useEffect, useState} from "react";
import { Form, Button, Image } from "react-bootstrap";

function PongButton (){
	return(
            <div className="container">
                <a href="/accueil" className="navbar-brand"><h1>Pong</h1></a>
            </div>
	);
}

function ProfilImage (user_avatar:string) {
	return (
        <div>
            <Image src={`${user_avatar}`} style={{width:"150px", height:"100px"}} alt="pp" rounded fluid/>
        </div>
    );
}

function Header () {
    const [isConnected, setConnexion] = useState(true);
    const [user_avatar, setAvatar] = useState("")
    const [id, setId] = useState(0);

    useEffect(() => {
        let isMounted = true;
        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => {
            console.log(isMounted)
            //if(isMounted) {
                setId(res.data.id);
                setAvatar(res.data.avatar)
                setConnexion(true);
            //}
        })
        .catch(res => {
            //if(isMounted) {
                setConnexion(false);
            //}
        })
        isMounted = false;
    }, []);
    
    if (isConnected)
    {
        return (
            <div>
                <nav className="Header navbar navbar-expand-sm navbar-dark bg-info"> {/*"navbar navbar-expand-sm navbar-dark bg-info mb-3 py-0"*/}
                <PongButton/>
                    <div className="d-flex flex-row-reverse">
                        {ProfilImage(user_avatar)}
                        <div className="col-">
                            <div className="row"><h4><a href={'/profile/'+id}>Profile</a></h4></div>
                            <div className="row"><h4><a href="/settings">Settings</a></h4></div>
                            <div className="row"><h4><a href="/auth/disconnect">Disconnect</a></h4></div>
                        </div>
                    </div>
                </nav>
            </div>
        )
    }
    else {
        return (
            <div>
                <nav className="Header navbar navbar-expand-sm navbar-dark bg-info"> {/*"navbar navbar-expand-sm navbar-dark bg-info mb-3 py-0"*/}
                <PongButton/>
                </nav>
            </div>
        )
    }
}

export default Header;

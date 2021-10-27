import { useHistory } from "react-router-dom";

import { useEffect, useState } from "react";
import axios from 'axios';

function Disconnect () {

    let history = useHistory();

    useEffect(() => {
        axios.get('http://localhost:8080/auth/disconnect',{
            withCredentials:true,
        })
        .then(res => {
            history.push("/auth/disconnect")
        })
        .catch(res => {
            history.push("/connexion");
        })
    }, []);

    return (
        <div>Disconnected</div>
    )
}

export default Disconnect;
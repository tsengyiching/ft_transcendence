import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from 'axios';

import { Button } from 'react-bootstrap'

function PageConnexion() {

    let history = useHistory();

    useEffect(() => {
        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => {
            history.push("/accueil");
        })
        .catch(res => {
            history.push("/connexion");
        })
    })

    return (
        <div>Connexion</div>
    )
}

export default PageConnexion;
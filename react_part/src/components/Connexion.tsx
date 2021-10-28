import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Button } from "react-bootstrap"

function Connexion () {

    function onConnexion() {
        window.location.href = 'http://localhost:8080/auth/login/'; 
    }

    return (
        <Button onClick={onConnexion}>
            Connexion
        </Button>
    )
}

export default Connexion;
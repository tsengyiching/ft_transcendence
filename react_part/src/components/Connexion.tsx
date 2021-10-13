import { BrowserRouter, Route, Switch } from "react-router-dom";

function Connexion () {
    return (
        <Route exact path='/connexion' component={() => { 
            window.location.href = 'http://localhost:8080/auth/login/'; 
            return null;
        }}/>
    )
}

export default Connexion;
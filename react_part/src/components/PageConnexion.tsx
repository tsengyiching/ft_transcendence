import 'bootstrap/dist/css/bootstrap.min.css'
import { useEffect, } from "react";
import { useHistory } from "react-router-dom";
import axios from 'axios';

function PageConnexion() {

    let history = useHistory();

    useEffect(() => {
        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => {
            history.push("/");
        })
        .catch(res => {
            history.push("/connexion");
        })
    })
}

export default PageConnexion;
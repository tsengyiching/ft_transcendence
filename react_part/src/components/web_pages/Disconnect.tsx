import { useHistory } from "react-router-dom";

import { useEffect } from "react";
import axios from 'axios';

interface STATE {
    setConnection:Function;
    //isConnected:boolean;
}

const Disconnect = (props:STATE) => {

    let history = useHistory();

    useEffect(() => {
        let isMounted = true;
        axios.get('http://localhost:8080/auth/disconnect',{
            withCredentials:true,
        })
        .then(res => {
            window.location.reload();
        })
        .catch(res => { if (isMounted)
            history.push("/connexion");
        })
        return (() => {isMounted = false})
    }, [history]);

    return (
        <div>Disconnected</div>
    )
}

export default Disconnect;
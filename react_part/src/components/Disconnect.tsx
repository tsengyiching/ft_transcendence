import { useHistory } from "react-router-dom";

import { useEffect } from "react";
import axios from 'axios';

function Disconnect () {

    let history = useHistory();

    useEffect(() => {
        let isMounted = true;

        axios.get('http://localhost:8080/auth/disconnect',{
            withCredentials:true,
        })
        .then(res => { if (isMounted)
            history.push("/auth/disconnect")
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
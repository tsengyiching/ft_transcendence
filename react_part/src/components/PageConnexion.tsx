import 'bootstrap/dist/css/bootstrap.min.css'
import { Link } from "react-router-dom";

import { Button } from 'react-bootstrap'

function ButtonConnexion() {
    return (
        <div className=".col-xl-">
            <Link to="/accueil">
                <Button>Connexion</Button>
            </Link>
        </div>
    )
}

export default ButtonConnexion;
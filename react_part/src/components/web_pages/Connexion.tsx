import { Button , Image} from "react-bootstrap"
import '../Connection.css';

function Connexion () {

    function onConnexion() {
        window.location.href = 'http://localhost:8080/auth/login/';
    }

    return (
        <div className='container'>
        <h1>Welcome to our ft_transcendence</h1>
        <Button className='btn' variant="primary" size='lg' onClick={onConnexion}>
            Connexion
        </Button>
        <Image className='img' src='https://i.imgur.com/pzpv7iF.gif' fluid/>
        </div>
    )
}

export default Connexion;
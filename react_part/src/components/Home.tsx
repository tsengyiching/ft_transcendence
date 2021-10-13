import { Form, Button } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import axios from 'axios'

import Talk from './Talk';
import Chat from './chat/Chat'


function Game() {
	return (
    <div className="col" style={{border:'1px solid black'}}>
        <div className="row align-self-center">
            <div className="col"></div>
             <div className="col">
                <Button>Créer / Rejoindre une partie</Button>
            </div>
            <div className="col">
                <Button>Créer / Rejoindre une partie bonus</Button>
            </div>
            <div className="col"></div>
		</div>
	</div>
	)
}

function Friend(props: {name: string, link_profile: string, link_picture: string, link_status: string, status_alt: string}) {
	return (
        <div className="col col-lg-2">
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand" href={props.link_profile}>
                     <img src={props.link_picture} width="30" height="30" alt=""/>
                    {props.name}
                    <img src={props.link_status} className="img-fluid" alt={props.status_alt} width="20"/>
                </a>
            </nav>
        </div>
	)
}

function Friends() {
	return (
            <div className="row">
				<Friend name="Bobek" link_profile="/profile" link_picture="https://cdn.futura-sciences.com/buildsv6/images/wide1920/4/a/0/4a02bf6947_50161932_gorille-coronavirus.jpg"
					link_status="https://upload.wikimedia.org/wikipedia/commons/a/a0/Rond_orange.png" status_alt="orange circle" />
				<Friend name="Martine" link_profile="/" link_picture="https://media.routard.com/image/24/9/pt72050.1281249.w430.jpg"
					link_status="https://www.png-gratuit.com/img/cercle-vert-fond-transparent.png" status_alt="green circle" />
				<Friend name="Babar" link_profile="/" link_picture="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKn2GIAH7auDdHRpZmNWQTzwAgZd-rWGynlg&usqp=CAU"
					link_status="https://www.png-gratuit.com/img/cercle-rouge-fond-transparent.png" status_alt="red circle" />
				<AddFriend />
            </div>
    )
}

function AddFriend() {
	return (
        <div className="d-flex justify-content-center">
            <Form className="w-50 p-3">
                <Form.Label>Ajouter un ami</Form.Label>
                <Form.Control type="name" placeholder="" />
                <Button type="submit">ajouter</Button>
            </Form>
        </div>
	);
}


function Accueil() {
    const [id, setId] = useState(0);
    const [name, setName] = useState("");

    useEffect(() => {

        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => {
            setId(res.data.id)
            setName(res.data.nickname)
        })
    })
    return (
        <div>
            <h2>Accueil</h2>
            <h3>{id}</h3>
            <h3>{name}</h3>
            <div className=".col-xl-">
                <div className="row">
					<Game />
                    <div className="col" style={{border:'1px solid black'}}>
						<Friends />
						<Chat />
					</div>
                </div>
            </div>
        </div>
    )
}

export default Accueil;
import { Form, Button } from 'react-bootstrap'
import React from 'react'

import Talk from './Talk';

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
			<React.Fragment>
				<Friend name="Bobek" link_profile="/profile" link_picture="https://cdn.futura-sciences.com/buildsv6/images/wide1920/4/a/0/4a02bf6947_50161932_gorille-coronavirus.jpg"
					link_status="https://upload.wikimedia.org/wikipedia/commons/a/a0/Rond_orange.png" status_alt="orange circle" />
				<Friend name="Martine" link_profile="/" link_picture="https://media.routard.com/image/24/9/pt72050.1281249.w430.jpg"
					link_status="https://www.png-gratuit.com/img/cercle-vert-fond-transparent.png" status_alt="green circle" />
				<Friend name="Babar" link_profile="/" link_picture="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKn2GIAH7auDdHRpZmNWQTzwAgZd-rWGynlg&usqp=CAU"
					link_status="https://www.png-gratuit.com/img/cercle-rouge-fond-transparent.png" status_alt="red circle" />
			</React.Fragment>
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

function Chat() {
	return (
	<React.Fragment>
    <div style={{border:'1px solid black'}} ><h4>Chat</h4></div>
    <div>
        <Button>Créer un salon normal</Button>
        <Button>Créer un salon privée</Button>
    </div>
     <div>
        <div className="row">
            <div className="col-4" style={{border:'1px solid black'}}>
                <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="/accueil">Salons</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/accueil">Messages privés</a>
                </li>
                </ul>
            </div>
            <div className="col" >
                <div style={{border:'1px solid black'}}><Talk ></Talk></div>
                <div className="d-flex justify-content-center">
                    <Form className="w-75 p-3">
                        <Form.Control type="name" placeholder="Message" />
                        <Button type="submit">envoyer</Button>
                    </Form>
                </div>
            </div>
        </div>
    </div>
	</React.Fragment>
	);
}

function Accueil() {
    return (
        <div>
            <h2>Accueil</h2>
            <div className=".col-xl-">
                <div className="row">
					<Game />
                    <div className="col" style={{border:'1px solid black'}}>
						<Friends />
						<AddFriend />
						<Chat />
					</div>
                </div>
            </div>
        </div>
    )
}

export default Accueil;
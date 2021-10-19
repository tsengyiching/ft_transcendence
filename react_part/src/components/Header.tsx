import React from 'react'
import "./Header.css"

function PongButton (){
	return(
            <div className="container">
                <a href="/accueil" className="navbar-brand"><h1>Pong</h1></a>
            </div>
	);
}

function ProfilImage () {
	return (
        <img src="https://cdn-images.zoobeauval.com/zEc_LhDPGUIUNXh2DPZwK1F3E9I=/730x730/https://s3.eu-west-3.amazonaws.com/images.zoobeauval.com/2020/06/sticker-2-5ee22a296cd7d.jpg" className="ProfilePicture" alt="singe"/>
	);
}

function Header () {
    return (
        <div>
            <nav className="Header navbar navbar-expand-sm navbar-dark bg-info"> {/*"navbar navbar-expand-sm navbar-dark bg-info mb-3 py-0"*/}
			<PongButton/>
                <div className="d-flex flex-row-reverse">
					<ProfilImage />
                    <div className="col-">
                        <div className="row"><h4><a href="/me">Profil</a></h4></div>
                        <div className="row"><h4><a href="/parametres">Paramètres</a></h4></div>
                        <div className="row"><h4><a href="/deconnexion">Deconnexion</a></h4></div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Header;

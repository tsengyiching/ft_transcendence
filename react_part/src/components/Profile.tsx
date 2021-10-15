import React, { useEffect, useState } from "react";
import axios from 'axios';

export default function Profile() {

    const [name, setName] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => {
            setName(res.data.nickname)
        })
        .catch(res => {
            console.log("error connexion")
        })
    }, []);
    
    /*printMatchsScore () {
        return (
            <div>
                {data.scores.map((score) => {
                    return (<h4> <img src={`${data.picture}`} className="img-fluid" width="100" alt="singe"/> {this.state.name} {score.score1} - {score.score2} {this.getName(score.idEnemy)} <img src={`${this.getPicture(score.idEnemy)}`} className="img-fluid" width="100" alt="singe"/></h4>)
                })}
            </div>
        )
    }

    printStatus (id: number) {
        let tab = this.getStatus(id)
        for (let i = 0; i < tab.length; i++) {
            if (tab[i] === undefined) {
                tab.splice(i)
            }
        }
        console.log(tab)
        if (this.getStatus(id).indexOf(1) === 0)
            return (<img src="https://www.png-gratuit.com/img/cercle-rouge-fond-transparent.png" className="img-fluid" alt="orange circle" width="20"/>)
        /*else if (this.getStatus(id) === 1)
            return (<img src="https://www.png-gratuit.com/img/cercle-vert-fond-transparent.png" className="img-fluid" alt="orange circle" width="20"/>)
        else
            return (<img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Rond_orange.png" className="img-fluid" alt="orange circle" width="20"/>)    
    }

    printFriendsList () {
        return (
            <div>
                {people.map((person) => {
                    return (
                        <h4>
                            <img src={`${this.getPicture(person.id)}`} className="img-fluid" width="100" alt="singe"/> 
                            {this.getName(person.id)}
                            {this.printStatus(person.id)}
                        </h4>
                    )
                })
                }
            </div>
        )
    }*/

    return (
        <div className="row">
            <div className="col">
                <h3>Profil : </h3>
                <h4>{name}</h4>
                <div className="row">
                    <div className="col">
                        <img src={`${"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKn2GIAH7auDdHRpZmNWQTzwAgZd-rWGynlg&usqp=CAU"}`} className="w-25" alt="singe"/>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        Total des matchs gagnés : {} <br></br>
                        Total des matchs perdus : {} <br></br><br></br><br></br>
                        Historique des matchs : {}
                    </div>
                </div>
            </div>
            <div className="col">
                {}
                <h4>Amis :</h4>
                <div className="col">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKn2GIAH7auDdHRpZmNWQTzwAgZd-rWGynlg&usqp=CAU" className="img-fluid" width="100" alt="singe"/>
                    Babar
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Rond_orange.png" className="img-fluid" alt="orange circle" width="20"/>
                </div>
                <div className="col">
                    <img src="https://cdn.futura-sciences.com/buildsv6/images/wide1920/4/a/0/4a02bf6947_50161932_gorille-coronavirus.jpg" className="img-fluid" width="100" alt="singe2"/>
                    Bobek
                    <img src="https://www.png-gratuit.com/img/cercle-vert-fond-transparent.png" className="img-fluid" alt="orange circle" width="20"/>
                </div>
                <div className="col">
                    <img src="https://media.routard.com/image/24/9/pt72050.1281249.w430.jpg" className="img-fluid" width="100" alt="singe3"/>
                    Martine
                    <img src="https://www.png-gratuit.com/img/cercle-rouge-fond-transparent.png" className="img-fluid" alt="orange circle" width="20"/>
                </div>
            </div>
        </div>
    )
}
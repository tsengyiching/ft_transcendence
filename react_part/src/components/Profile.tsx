import React, { Component } from "react";

const data = {
    "id": 12,
    "name": "Nillem",
    "numberWin": 0,
    "numberLose": 15,
    "picture": "https://cdn-images.zoobeauval.com/zEc_LhDPGUIUNXh2DPZwK1F3E9I=/730x730/https://s3.eu-west-3.amazonaws.com/images.zoobeauval.com/2020/06/sticker-2-5ee22a296cd7d.jpg" ,
    "scores": [
        {
            "idEnemy": 28,
            "score1" : 0,
            "score2" : 15,
        },
        {
            "idEnemy": 35,
            "score1" : 0,
            "score2" : 12,
        },
        {
            "idEnemy": 34,
            "score1" : 0,
            "score2" : 12,
        }
    ],
    "friendsId": [28, 35, 34]
}

const people = [
    {"id": 28, "name": "Babar", "status": "1", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKn2GIAH7auDdHRpZmNWQTzwAgZd-rWGynlg&usqp=CAU"},
    {"id": 35, "name": "Bobek", "status": "2", "image": "https://cdn.futura-sciences.com/buildsv6/images/wide1920/4/a/0/4a02bf6947_50161932_gorille-coronavirus.jpg"},
    {"id": 34, "name": "Martine", "status": "0", "image": "https://media.routard.com/image/24/9/pt72050.1281249.w430.jpg"},
    {"id": 12, "name": "Nillem", "status": "1", "image": "https://cdn-images.zoobeauval.com/zEc_LhDPGUIUNXh2DPZwK1F3E9I=/730x730/https://s3.eu-west-3.amazonaws.com/images.zoobeauval.com/2020/06/sticker-2-5ee22a296cd7d.jpg"}
]

interface IProps {
}

interface IState {
    id : number;
    name: string;
}

class Profile extends Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            id: this.getId(),
            name: data.name
        };
    }

    getId () {
        return (data.id)
    }

    getName (id : number) {
        return (
            people.map((person) => {
                if (id === person.id) {
                    return (person.name)
                }
            })
        )
    }
    
    getStatus (id : number) {
        let status : number;
        return (
            people.map((person) => {
                if (id === person.id) {
                    status = parseInt(person.status)
                    return (status)
                }
            })
        )
    }

    getNumberWin (id : number) {
        return (data.numberWin)
    }

    getNumberLose (id : number) {
        return (data.numberLose)
    }

    getPicture (id : number) {
        return (
            people.map((person) => {
                if (id === person.id)
                    return (person.image)
            })
        )
    }

    printMatchsScore () {
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
    */}

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
    }

    render () {
        return (
            <div className="row">
                <div className="col">
                    <h3>Profil : </h3>
                    <h4>{this.state.name}</h4>
                    <div className="row">
                        <div className="col">
                            <img src={`${data.picture}`} className="w-25" alt="singe"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            Total des matchs gagnés : {this.getNumberWin(this.state.id)} <br></br>
                            Total des matchs perdus : {this.getNumberLose(this.state.id)} <br></br><br></br><br></br>
                            Historique des matchs : {this.printMatchsScore()}
                        </div>
                    </div>
                </div>
                <div className="col">
                    {this.printFriendsList()}
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
}

export default Profile;
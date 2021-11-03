import React, { useEffect, useState } from "react";
import axios from 'axios';
import { getNameOfDeclaration } from "typescript";
import {Image, Row, Col} from 'react-bootstrap'

import {useParams} from "react-router-dom";

export default function Profile() {

    const [validate, setValidate] = useState(true);
    const [name, setName] = useState("");
    const [idMain, setId] = useState(0);
    const [avatar, setAvatar] = useState("")
    const [friends, setFriends] = useState([]);
    const [games, setGames] = useState([]);
    const [profiles, setProfiles] = useState([]);

    const { clientId }: { clientId: string } = useParams();

    useEffect(() => {
        let isMounted = true;
        axios.get('http://localhost:8080/profile/' + clientId,{
            withCredentials:true,
        })
        .then(res => {
            if (isMounted) {
                setName(res.data.nickname)
                setId(res.data.id)
                setAvatar(res.data.avatar)
            }
        })
        .catch(res => {
            if (isMounted) {
                setValidate(false);
            }
        })

        axios.get('http://localhost:8080/relationship/'+clientId+'/list?status=friend',{
            withCredentials:true,
        })
        .then(res => {
            if (isMounted) {
                setFriends(res.data)
            }
        })
        .catch(res => {
            if (isMounted) {
                setValidate(false);
            }
        })

        axios.get('http://localhost:8080/game/'+clientId+'/records',{
            withCredentials:true,
        })
        .then(res => {
            if (isMounted) {
                setGames(res.data)
            }
        })
        .catch(res => {
            if (isMounted) {
                setValidate(false);
            }
        })

        axios.get('http://localhost:8080/profile/all',{
            withCredentials:true,
        })
        .then(res => {
            if (isMounted) {
                setProfiles(res.data)
            }
        })
        .catch(res => {
            if (isMounted) {
                setValidate(false);
            }
        })
        return () => { isMounted = false };
    }, [axios]);

    /*
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
        else if (this.getStatus(id) === 1)
            return (<img src="https://www.png-gratuit.com/img/cercle-vert-fond-transparent.png" className="img-fluid" alt="orange circle" width="20"/>)
        else
            return (<img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Rond_orange.png" className="img-fluid" alt="orange circle" width="20"/>)    
    }

    */

    function getPicture (iduser:number):string {
        let url:string = "";
        profiles.map(({id, nickname, avatar, date, status, email, twoFactor}) => {
            if (iduser === id)
                url = avatar;
        })
        return(url);
    }

    function getName (iduser:number):string {
        let name:string = "";
        profiles.map(({id, nickname, avatar, date, status, email, twoFactor}) => {
            if (iduser === id)
                name = nickname;
        })
        return(name);
    }

    function winningMatches ():number {
        let total:number = 0;
        games.map(({id, mode, date, updateDate, userScore, opponentId, opponentScore, userGameStatus}) => {
            if (userGameStatus === "Won")
                total += 1;
        })
        return (total);
    }

    function lostMatches ():number {
        let total:number = 0;
        games.map(({id, mode, date, updateDate, userScore, opponentId, opponentScore, userGameStatus}) => {
            if (userGameStatus === "Lost")
                total += 1;
        })
        return (total)
    }

    function printFriendsList () {
        return (
            <div>
                {friends.map(({user_id, user_nickname, user_avatar, status}) => {
                    return (
                        <div key={user_id}>
                            <a href={'/profile/'+user_id}>
                                <Image src={`${user_avatar}`} style={{width:"150px", height:"100px"}} alt="pp" rounded fluid/>
                            </a>
                            {user_nickname}
                            {status}
                        </div>
                    )
                })
                }
            </div>
        )
    }

    function printMatchsScore () {
        return (
            <div>
                {games.map(({gameId, mode, date, updateDate, userScore, opponentId, opponentScore, userGameStatus}) => {
                    return ( 
                        <div key={`${gameId}-matchsScore`}>
                            <h4> 
                                <Row>
                                    <Col lg={4}>
                                        <Image src={`${getPicture(idMain)}`} width="100" alt="pp" rounded/>
                                    </Col>
                                    <Col>
                                        {` ${name} ` }
                                        {` ${userScore} - ${opponentScore} `}
                                        {` ${getName(opponentId)} `}
                                    </Col>
                                    <Col lg={4}>
                                        <a href={'/profile/'+opponentId}>
                                            <Image src={`${getPicture(opponentId)}`} width="100" alt="pp" rounded/>
                                        </a>
                                    </Col>
                                </Row>
                            </h4>
                        </div>
                    )
                })}
            </div>
        )
    }

    function Validate() {
        return (
            <div className="row">
                <div className="col">
                    <h3>Profile :</h3>
                    <h4>{name}</h4>
                    <div className="row">
                        <div className="col">
                            <Image src={`${avatar}`} className="w-50" alt="singe" rounded/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            Total matches win : {winningMatches()} <br></br>
                            Total matches lost : {lostMatches()} <br></br><br></br><br></br>
                            <Row>
                                <Col lg={2}>
                                </Col>
                                <Col lg={8}>
                                match history : {printMatchsScore()}
                                </Col>
                                <Col>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
                <div className="col">
                    {}
                    <h4>Friends :</h4>
                    <Row>
                        <Col lg={4}>
                        </Col>
                        <Col lg={4}>
                            {printFriendsList()}
                        </Col>
                        <Col>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }

    function Unvalidate() {
        return (
            <div> Error profile doesn't exist</div>
        )
    }

    function PrintProfile() {
        if (validate === false)
            return Unvalidate();
        else
            return Validate();
    }

    return (
        <PrintProfile/>
    )
}
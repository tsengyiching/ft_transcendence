import axios from 'axios';
import { useState, useEffect } from "react";
import {Image} from 'react-bootstrap'

export default function Ladder() {
    const [games, setGames] = useState([]);
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        let isMounted = true;
        axios.get('http://' + process.env.REACT_APP_DOMAIN_BACKEND + '/game/all',{
            withCredentials:true,
        })
        .then(res => { if (isMounted) {
                setGames(res.data);
            }
        })
        .catch(res => { if (isMounted) {
                console.log("err");
            }
        })

        axios.get('http://' + process.env.REACT_APP_DOMAIN_BACKEND + '/profile/all',{
            withCredentials:true,
        })
        .then(res => {
            if (isMounted) {
                setProfiles(res.data);
            }
        })
        .catch(res => {

        })
        return () => { isMounted = false };
    }, [])

    function getPicture (iduser:number):string {
        let url:string = "";
        profiles.forEach(({id, nickname, avatar, date, status, email, twoFactor}) => {
            if (iduser === id)
                url = avatar;
        })
        return(url);
    }

    function getName (iduser:number):string {
        let name:string = "";
        profiles.forEach(({id, nickname, avatar, date, status, email, twoFactor}) => {
            if (iduser === id)
                name = nickname;
        })
        return(name);
    }

    function fillData(){
        var list:number[]
        var listWinner:number[][]
        var data = []
        var max = 0;
        var comp = 0;
        var res;
        var res2;
        list = [];
        listWinner = [];
        games.forEach(({id, mode, status, updateDate, leftUserId, leftUserScore, rightUserId, rightUserScore, winnerId}) => {
            list.push(winnerId)
        })
        for (let i = 0; list[i]; i++){
            res = 0
            res2 = 0
            max = 0
            for (let j = 0; list[j]; j++){
                if (list[i] === list[j])
                    res += 1
            }
            for (let k = 0; listWinner[k]; k++) {
                if (listWinner[k][0] === list[i])
                    res2 = 1
            }
            if (res2 === 0) {
                listWinner.push([list[i], res])
            }
        }
        for(let i = 0; listWinner[i]; i++) {
            if (listWinner[i][1] > max)
                max = listWinner[i][1]
        }
        for(let j = max; j >= 0; j--) {
            for(let i = 0; listWinner[i]; i++) {
                if (listWinner[i][1] === j ) {
                    comp++
                    var user = {image:getPicture(listWinner[i+1][0]), position:comp, name:getName(listWinner[i][0]), score:listWinner[i][1], id:listWinner[i][0]};
                    data.push(user)
                }
            }
        }
        return(data)
    }

    function printLadder () {
        var data = fillData()
        return (
            <div>
                {data.map(({image, position, name, score, id}) => {
                    return (
                        <div key={`${id}`}>
                            <div className="row">
                                <div className="col">
                                    <div className="row">
                                        <a href={'/profile/'+id}>
                                            <Image src={`${image}`} width="40" height="40" alt="pp" rounded/>
                                        </a>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="row">
                                        {position}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="row">
                                        {name}
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="row">
                                        {score}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div>
            Ladder :
            <div className="row">
                <div className="col">
                    <div className="row">
                         Image
                    </div>
                </div>
                <div className="col">
                    <div className="row">
                         Position
                    </div>
                </div>
                <div className="col">
                    <div className="row">
                        Nom
                    </div>
                </div>
                <div className="col">
                    <div className="row">
                        Score
                    </div>
                </div>
            </div>
            <div>{printLadder()}</div>
        </div>
    )
}
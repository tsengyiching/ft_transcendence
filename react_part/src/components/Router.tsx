import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from './web_pages/Home';
import Profile from './web_pages/Profile';
import Settings from './settings/Settings';
import Connexion from './web_pages/Connexion';
import Disconnect from './web_pages/Disconnect';
import Twofa from "./Twofa";
import Header from "./web_pages/Header";
import Ladder from "./web_pages/Ladder";
import Admin from "./Admin/Admin";
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from "react";
import Ban from "./web_pages/Ban";
import {DataContext, SiteStatus} from "../App"
import {GameSocketContext, gameSocket} from '../context/gameSocket';

import GameStartModal from './GameStartModal'

function Authorized() {

  const userData = useContext(DataContext);

  return (
    <BrowserRouter>
      <GameSocketContext.Provider value={gameSocket}>
      <GameStartModal />
      <Header />
      <Switch>
        <Route exact path="/home" component={Home} />
        <Route exact path="/profile/:clientId" component={Profile} />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/disconnect" component={Disconnect} />
        <Route exact path="/ban" component={Ban} />
        <Route exact path="/ladder" component={Ladder}/>
        {(userData.siteStatus === SiteStatus.MODERATOR || userData.siteStatus === SiteStatus.OWNER) &&
        <Route exact path="/admin" component={Admin}/>}
        <Redirect to="/home"/>
      </Switch>
      
      </GameSocketContext.Provider>

    </BrowserRouter>
  )
}

function Unauthorized(props: {setConnection: Function}) {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/connexion" component={Connexion} />
        <Route path="/2fa" component={() => <Twofa setConnection={props.setConnection}/>}/>
        <Redirect to="/connexion"/>
      </Switch>
    </BrowserRouter>
  )
}

function Router() {

  const [isConnected, setConnection] = useState<number>(0);
  const [twofa, setTwofa] = useState<boolean>(false);

  const getProfile= useCallback (async () => {

   await axios.get('http://localhost:8080/profile/me/',{
        withCredentials:true,
    })
    .then(res => {
        setTwofa(res.data.isTwoFactorAuthenticationEnabled);
        if (!twofa)
          setConnection(1)
    })
    .catch(res => { 
        setConnection(2)
    })
  }, [twofa])

  function Print() {

    useEffect(() => {
     getProfile();
    }, [])

    return(
      <div>
        {
          isConnected == 0 ?
          <div></div> :
          isConnected == 1 ?
          <Authorized/> :
          <Unauthorized setConnection={setConnection}/>
        }
    </div>
    )
  }

  return (<Print/>);
}

export default Router;
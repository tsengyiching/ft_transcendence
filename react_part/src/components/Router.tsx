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
import { useContext, useState } from "react";
import Ban from "./web_pages/Ban";
import {DataContext, SiteStatus} from "../App"
import {GameSocketContext, gameSocket} from '../context/gameSocket';

import GameStartModal from './GameStartModal'

function Router() {

  const [isConnected, setConnection] = useState<boolean>(false);
  const [twofa, setTwofa] = useState<boolean>(false);
  const userData = useContext(DataContext);

  function getProfile () {
    let isMounted = true;
    console.log(isConnected)
    axios.get('http://localhost:8080/profile/me/',{
        withCredentials:true,
    })
    .then(res => { if (isMounted)
        setTwofa(res.data.isTwoFactorAuthenticationEnabled);
        if (!twofa)
          setConnection(true)
    })
    .catch(res => { if (isMounted)
        setConnection(false)
    })
    return (() => {isMounted = false;})
  }

  function Authorized() {
    return (
      <BrowserRouter>
        <GameSocketContext.Provider value={gameSocket}>
        <GameStartModal />

        <Header />
		<div className="Body">
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
		</div>
        </GameSocketContext.Provider>

      </BrowserRouter>
    )
  }

  function Unauthorized() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/connexion" component={Connexion} />
          <Route path="/2fa" component={() => <Twofa setConnection={setConnection}/>}/>
          <Redirect to="/connexion"/>
        </Switch>
      </BrowserRouter>
    )
  }

  function Print() {
    async function asynchTest() {
      await getProfile();
    }

    asynchTest()
    if (isConnected)
      return (<Authorized/>)
    else
      return (<Unauthorized/>)
  }

  return (
    <Print/>
  )
}

export default Router;
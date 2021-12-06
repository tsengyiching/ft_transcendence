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
import { useContext, useEffect, useState } from "react";
import Ban from "./web_pages/Ban";
import {DataContext, SiteStatus} from "../App"

function Router() {

  const [isConnected, setConnection] = useState<boolean>(false);
  const [twofa, setTwofa] = useState<boolean>(false);
  const userData = useContext(DataContext);

  useEffect(() => {
    axios.get('http://localhost:8080/profile/me/',{
        withCredentials:true,
    })
    .then(res => {
        setTwofa(res.data.isTwoFactorAuthenticationEnabled);
        if (!twofa)
          setConnection(true)
    })
    .catch(res => {
        setConnection(false)
    })
  });


  function Authorized() {
    return (
      <BrowserRouter>
        <Header/>
        <Switch>
          <Route exact path="/home" component={Home} />
          <Route exact path="/profile/:clientId" component={Profile} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/disconnect" component={Disconnect} />
          <Route exact path="/ban" component={Ban} />
          <Route exact path="/ladder" component={Ladder}/>
          {(userData.siteStatus == SiteStatus.MODERATOR || userData.siteStatus == SiteStatus.OWNER) &&
          <Route exact path="/admin" component={Admin}/>}
          <Redirect to="/home"/>
        </Switch>
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
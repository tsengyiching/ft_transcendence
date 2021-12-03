import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from './Home';
import Profile from './Profile';
import Settings from './settings/Settings';
import Connexion from './Connexion';
import Disconnect from './Disconnect';
import Twofa from "./Twofa";
import Ladder from "./Ladder";
import Header from "./Header";
import axios from 'axios';
import { useEffect, useState } from "react";
import Ban from "./Ban";

function Router() {

  const [isConnected, setConnection] = useState<boolean>(false);
  const [twofa, setTwofa] = useState<boolean>(false);

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
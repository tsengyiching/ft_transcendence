import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from './Home';
import Profile from './Profile';
import Settings from './Settings';
import Connexion from './Connexion';
import Disconnect from './Disconnect';
import Twofa from "./Twofa";
import Header from "./Header";
import { useHistory } from "react-router-dom";

import axios from 'axios';
import { useEffect, useState } from "react";
import { Form, Button, Image } from "react-bootstrap";
import Ban from "./Ban";

function Router() {

  const [isConnected, setConnection] = useState<boolean>(false);
  const [twofa, setTwofa] = useState<boolean>(false);

  useEffect(() => {
    axios.get('http://localhost:8080/profile/me/',{
        withCredentials:true,
    })
    .then(res => {
        // setTwofa(res.data.isTwoFactorAuthenticationEnabled);
        // //if (!twofa)
        setConnection(true)
    })
    .catch(res => {
        console.log('DIABLERIE');
        setConnection(false)
    })
  });


  function Authorized() {
    return (
      <BrowserRouter>
        <Header/>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/profile/:clientId" component={Profile} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/auth/disconnect" component={Disconnect} />
          <Route exact path="/ban" component={Ban} />
          <Route component={Home} />
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
          <Route component={Connexion} />
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
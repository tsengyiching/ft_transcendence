import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from './web_pages/Home';
import Profile from './web_pages/Profile';
import Settings from './web_pages/Settings';
import Connexion from './web_pages/Connexion';
import Disconnect from './web_pages/Disconnect';
import Twofa from "./Twofa";
import Header from "./web_pages/Header";
import axios from 'axios';
import { useEffect, useState } from "react";
import Ban from "./web_pages/Ban";

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
        <Header />
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
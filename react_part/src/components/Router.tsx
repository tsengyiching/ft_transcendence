import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import PageConnexion from './PageConnexion';
import Accueil from './Home';
import Profile from './Profile';
import Parametres from './Parameters';
import Connexion from './Connexion';

import axios from 'axios';
import { useEffect, useState } from "react";

function Router() {

  const [isConnected, setConnexion] = useState(false);

  useEffect(() =>{
    axios.get('http://localhost:8080/profile/me/',{
        withCredentials:true,
    })
    .then(res => {
        setConnexion(true)
    })
    .catch(res => {
        setConnexion(false)
    })
  });

  function Authorized() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/accueil" component={Accueil} />
          <Route exact path="/me" component={Profile} />
          <Route exact path="/parametres" component={Parametres} />
          <Redirect to="/accueil"/>
        </Switch>
      </BrowserRouter>
    )
  }

  function Unauthorized() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={PageConnexion} />
          <Route exact path="/connexion" component={Connexion} />
          <Redirect to="/"/>
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
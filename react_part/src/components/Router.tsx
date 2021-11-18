import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from './Home';
import Profile from './Profile';
import Settings from './Settings';
import Connexion from './Connexion';
import Disconnect from './Disconnect';

import { useHistory } from "react-router-dom";

import axios from 'axios';
import { useEffect, useState } from "react";
import { Form, Button, Image } from "react-bootstrap";

function Router() {

  const [isConnected, setConnexion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    axios.get('http://localhost:8080/profile/me/',{
        withCredentials:true,
    })
    .then(res => {
        setConnexion(true)
    })
    .catch(res => {
        setConnexion(false)
    })
    isMounted = false;
  }, []);

  function Twofa () {
    const [code, setCode] = useState("")

    let history = useHistory();

    function authenticate() {
        axios.post('http://localhost:8080/2fa/authenticate/',{twoFactorAuthenticationCode: code},
            {withCredentials:true,
        })
        .then(res => {
          setConnexion(true)
        })
        .catch(res => {
            console.log(res)
        })
    }

    function SubmitCode(event: any) {
        event.preventDefault();
        authenticate();
    }

    function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}
    return (
        <div>
            <Form className="" onSubmit={SubmitCode} >
            <Form.Control type="code" value={code} name="code" placeholder="Enter the 6 digits code" onChange={ChangeCode} />
                <Button variant="success" type="submit">
                    activate
                </Button>
            </Form>
        </div>
    )
}

  function Authorized() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/accueil" component={Home} />
          <Route exact path="/profile/:clientId" component={Profile} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/auth/disconnect" component={Disconnect} />
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
          <Route exact path="/2fa" component={Twofa} />
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
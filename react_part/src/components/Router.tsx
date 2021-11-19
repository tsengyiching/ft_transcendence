import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from './Home';
import Profile from './Profile';
import Settings from './Settings';
import Connexion from './Connexion';
import Disconnect from './Disconnect';
import Twofa from "./Twofa";
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
        setTwofa(res.data.isTwoFactorAuthenticationEnabled);
        if (!twofa)
          setConnection(true)
    })
    .catch(res => {
        setConnection(false)
    })
  });

//   function Twofa () {
//     const [code, setCode] = useState("")

//     function authenticate() {
//         axios.post('http://localhost:8080/2fa/authenticate/',{twoFactorAuthenticationCode: code},
//             {withCredentials:true,
//         })
//         .then(res => {
//           setConnection(true)
//         })
//         .catch(res => {
//             console.log(res)
//         })
//     }

//     function SubmitCode(event: any) {
//         event.preventDefault();
//         authenticate();
//     }

//     function ChangeCode(e: React.ChangeEvent<HTMLInputElement>) { setCode(e.currentTarget.value);}

//     return (
//         <div>
//             <Form className="" onSubmit={SubmitCode} >
//             <Form.Control type="code" value={code} name="code" placeholder="Enter the 6 digits code" onChange={ChangeCode} />
//                 <Button variant="success" type="submit">
//                     activate
//                 </Button>
//             </Form>
//         </div>
//     )
// }

  function Authorized() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/accueil" component={Home} />
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
          <Route path="/2fa" element={<Twofa isConnected={isConnected} setConnection={setConnection}/>}/>
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
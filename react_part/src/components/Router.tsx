import { BrowserRouter, Route, Switch } from "react-router-dom";
import ButtonConnexion from './ConnexionPage';
import Accueil from './Accueil';
import Profile from './Profile';
import Parametres from './Parametres';

function Router() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={ButtonConnexion} />
          <Route exact path="/accueil" component={Accueil} />
          <Route exact path="/me" component={Profile} />
          <Route exact path="/parametres" component={Parametres} />
        </Switch>
      </BrowserRouter>
    )
}

export default Router;
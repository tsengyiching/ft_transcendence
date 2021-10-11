import './App.css';
import Router from './components/Router';
import Header from './components/Header';
import { Container } from 'react-bootstrap';
import {SocketContext, socket} from './context/socket'

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <Container fluid className="App">
        <Header/>
        <Router></Router>
      </Container>
    </SocketContext.Provider>
  );
}

export default App;


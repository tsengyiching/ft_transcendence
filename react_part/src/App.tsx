import './App.css';
import Router from './components/Router';
import Header from './components/Header';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container fluid className="App">
      <Header/>
      <Router></Router>
    </Container>
  );
}

export default App;


import './App.css';
import Router from './components/Router';
import Header from './components/Header';
import { Container } from 'react-bootstrap';
import {SocketContext, socket} from './context/socket'
import axios from 'axios'
import React, { useState, useEffect } from 'react';

enum OnlineStatus {
	AVAILABLE = 'Available',
	PALYING = 'Playing',
	OFFLINE = 'Offline',
      }

interface Data {
  id: number,
  nickname: string,
  avatar: string,
  createDate: Date,
  userStatus: OnlineStatus,
  email: string,
  isTwoFactorAuthenticationEnabled: boolean,
}

const emptyuser: Data = {id: 0, nickname: "", avatar: "", createDate: new Date(1980,1,2, 12,34,56),
userStatus: OnlineStatus.AVAILABLE, email: "", isTwoFactorAuthenticationEnabled: false};
export const DataContext = React.createContext(emptyuser);

function App() {
  
  const [userData, SetuserData] = useState<Data>(emptyuser);

  useEffect(() => {

    axios.get("http://localhost:8080/profile/me", {withCredentials: true})
    .then((res) => SetuserData(res.data))
    .catch(res => console.log(`error in context user : ${res.data}`))
  }, [])
  
  return (
    <DataContext.Provider value={userData}>
    <SocketContext.Provider value={socket}>
      <Container fluid className="App">
        <Header/>
        <Router/>
      </Container>
    </SocketContext.Provider>
    </DataContext.Provider>
  );
}

export default App;

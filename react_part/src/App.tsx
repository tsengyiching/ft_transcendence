import './App.css';
import Router from './components/Router';
import Header from './components/Header';
import { Container } from 'react-bootstrap';
import {SocketContext, socket} from './context/socket'
import {GameSocketContext, gameSocket} from './context/gameSocket';
import GameStartModal from './components/GameStartModal'

import axios from 'axios'
import React, { useState, useEffect } from 'react';
import "bootswatch/dist/sketchy/bootstrap.min.css";
// import './bootswatch.scss';

enum OnlineStatus {
	AVAILABLE = 'Available',
	PALYING = 'Playing',
	OFFLINE = 'Offline',
      }

export enum SiteStatus {
  OWNER = 'Owner',
  MODERATOR = 'Moderator',
  USER = 'User',
  BANNED = 'Banned',
}

export interface Data {
  id: number,
  nickname: string,
  avatar: string,
  createDate: Date,
  userStatus: OnlineStatus,
  siteStatus: SiteStatus,
  email: string,
  isTwoFactorAuthenticationEnabled: boolean,
}

const emptyuser: Data = {id: 0, nickname: "", avatar: "", createDate: new Date(1980,1,2, 12,34,56),
userStatus: OnlineStatus.AVAILABLE, siteStatus: SiteStatus.USER, email: "", isTwoFactorAuthenticationEnabled: false};
export const DataContext = React.createContext(emptyuser);

function App() {
  
  const [userData, SetuserData] = useState<Data>(emptyuser);

  useEffect(() => {
    let isMounted = true;
    axios.get("http://localhost:8080/profile/me", {withCredentials: true})
    .then((res) => {if(isMounted) {SetuserData(res.data)} })
    .catch(res => {if(isMounted) {console.log(`error in context user : ${res.data}`)}})

    return (() => {isMounted = false});
  }, [])
  
//add useEffect for changing status site

  return (
    <DataContext.Provider value={userData}>
    	<SocketContext.Provider value={socket}>
      <GameSocketContext.Provider value={gameSocket}>
			<GameStartModal />
    		<Container fluid className="App">
    		    <Router/>
    		</Container>
        </GameSocketContext.Provider>

    	</SocketContext.Provider>
    </DataContext.Provider>
  );
}

export default App;
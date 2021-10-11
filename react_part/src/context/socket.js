import React from 'react'
import {io} from "socket.io-client";

export const socket = io.connect("http://localhost:8080/chat", {withCredentials: true,});
export const SocketContext = React.createContext();
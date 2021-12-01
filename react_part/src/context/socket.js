import React from 'react'
import * as io from "socket.io-client";

export const socket = io.connect("http://localhost:8080", {withCredentials: true,});
export const SocketContext = React.createContext();
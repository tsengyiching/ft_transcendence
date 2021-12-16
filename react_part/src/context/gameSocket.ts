import React from 'react'
import io, { Socket } from "socket.io-client";

export const gameSocket:Socket = io("http://localhost:8080/pong", {withCredentials: true,});
export const GameSocketContext: React.Context<any> = React.createContext(undefined);
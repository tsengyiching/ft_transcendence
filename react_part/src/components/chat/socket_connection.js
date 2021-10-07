import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Messages from './Messages';
import MessageInput from './MessageInput';
import { Button } from 'react-bootstrap'

function SocketConnection() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`http://localhost:8080`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  return (
    <div className="SocketConnection">
      <header className="app-header">
        React Chat
      </header>
      { socket ? (
          <Button> Connected with the socket </Button>
      ) : (
        <div>Not Connected</div>
      )}
    </div>
  );
}

export default SocketConnection;
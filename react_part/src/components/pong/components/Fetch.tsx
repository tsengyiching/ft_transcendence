import { useEffect , useState, useContext} from "react";
import axios from 'axios';
import io, {Socket} from 'socket.io-client';
import useKeyPressCB from "../hooks/UseKeyPressCB";
import { GameSocketContext } from "../context/gameSocket";
import SocketEvent from "./SocketEvent";
import SocketInfos from "./SocketInfos";
import Pong from "./Pong";

const Fetch:React.VFC<{}> = () => {
    const socket:Socket = useContext(GameSocketContext);
    const [Response, setResponse] = useState<string>('');
    const [ready, setReady] = useState<Boolean>(false);
    const [num, setNum] = useState<number>(0);
    useEffect(() => {
        console.log(`socket id  ${socket.id}`)
        socket.on('message', (data) => {setResponse(data);});
        socket.on('reload', () => {
          setNum(0);
          setReady(false);
        });
        
        
        if (!ready){
          socket.on('go', () => {socket.emit("gameon", ``);})
          socket.on('gameOk', res => { setReady(res);})
        }
        if (ready && !num)
        {
          setNum(1);
          console.log('okok');
          socket.emit('start', '');
        }
    })

    console.log(Response);
    return <div>
              <SocketEvent />
              <SocketInfos />
              {ready ? 				<Pong h={800} w={1000}/>: <div></div>}
              {ready ? <p>game [{num}]</p> : <p>waiting for players ...</p>}
              <p>connected : {Response}</p>
              <button onClick={() => socket.emit('sub', 1)}>player 1</button>
              <button onClick={() => socket.emit('sub', 2)}>player 2</button>
            </div>;
}

export default Fetch



import React, { useState, useEffect, useContext } from "react"
import { Placeholder, Row } from "react-bootstrap"
import {SocketContext} from "../../context/socket"

interface IChannel {
        channel_id: number,
        channel_name: string,
        channel_type: 'Private' | 'Public'
        role: 'Owner' | 'Admin' | 'User';
        status: 'Normal' | 'Mute' | 'Ban';
}

function ListChannel()
{
        let color = "warning";
        let number = 39;
        let socket = useContext(SocketContext);
        const [Channels, SetChannels] = useState<IChannel[] | undefined>(undefined);

        useEffect(() => {
                socket.on("channel-list", (data: IChannel[]) => SetChannels(data));
        }, Channels);

	return(
                <Row>
                        {[...Array(number)].map(
                        (value: undefined, index: number) => (
                        <Placeholder md={20} bg={color} key={index} />
                          )
                        )}
                </Row>
	)

}

export default ListChannel
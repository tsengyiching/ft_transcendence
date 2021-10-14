import React, { useState, useEffect, useContext } from "react"
import { Placeholder, Row, Button, Image } from "react-bootstrap"
import {SocketContext} from "../../context/socket"
import './Chat.css'
import PadlockImage from "../pictures/Padlock-symbol.png"
import GlobeImage from "../pictures/earth-globe-world-globe-drawing-sticker.jpeg"
import CrownImage from "../pictures/Crown.jpg"
import StarImage from "../pictures/star1.jpeg"
import MSNImage from "../pictures/people.jpeg"
import NormalImage from "../pictures/volume-on.png"
import MuteImage from "../pictures/volume-off.jpeg"
import BlockImage from "../pictures/redx.png"

interface IMyChannel {
        channel_id: number,
        channel_name: string,
        channel_type: 'Private' | 'Public'
        role: 'Owner' | 'Admin' | 'User';
        status: 'Normal' | 'Mute' | 'Ban';
}

interface IOtherChannel {
        channel_id: number,
        channel_name: string,
        channel_type: 'Private' | 'Public'
}

interface IUseStateChannel {
        channelSelected: {channel_id: number, channel_name: string} | undefined;
        setChannelSelected: React.Dispatch<React.SetStateAction<{channel_id: number; channel_name: string;} | undefined>>
}

function ListChannel(props: IUseStateChannel) {
        let socket = useContext(SocketContext);
        const [MyChannels, SetMyChannels] = useState<IMyChannel[]>([]);
        const [OthersChannels, SetOthersChannels] = useState<IOtherChannel[]>([]);

        function ButtonMyChannel(Channel: IMyChannel) {
                let channel_id = Channel.channel_id;
                let channel_name = Channel.channel_name;
                
                return (
                <Button key={channel_id} className="ButtonMyChannel" onClick={(e) => (props.setChannelSelected({channel_id, channel_name}))}>
                        {Channel.channel_type === 'Private' ?
                        <Image src={PadlockImage} className="LogoChannel" roundedCircle alt="padlock"/>
                        : <Image src={GlobeImage} className="LogoChannel" roundedCircle alt="globe"/>}
                        
                        {Channel.role === 'Owner' ? 
                        <Image src={CrownImage} className="LogoChannel" roundedCircle alt="crown"/>
                        : Channel.role === "Admin" ?
                        <Image src={StarImage} className="LogoChannel" roundedCircle alt="star"/>
                        : <Image src={MSNImage} className="LogoChannel" roundedCircle alt="people"/>}
                        
                        {Channel.status === 'Normal' ? 
                        <Image src={NormalImage} className="LogoChannel" roundedCircle alt="normal"/>
                        : Channel.status !== "Mute" ?
                        <Image src={MuteImage} className="LogoChannel" roundedCircle alt="mute"/>
                        : <Image src={BlockImage} className="LogoChannel" roundedCircle alt="block"/>}
                        
                        {Channel.channel_name}
                </Button>
                )
        }

        function ButtonOtherChannel(Channel: IOtherChannel) {
                let channel_id = Channel.channel_id;
                let channel_name = Channel.channel_name;
                
                return (
                        <Button key={channel_id}>
                                {channel_name}
                        </Button>
                )
        }


        useEffect(() => {
                socket.on("channels-user-in", (data: IMyChannel[]) => SetMyChannels(data));
                socket.on("channels-user-out", (data: IOtherChannel[]) => SetOthersChannels(data));

                console.log("My Channels:")
                console.log(MyChannels);
                console.log("Others Channels:")
                console.log(OthersChannels);
        }, [MyChannels, OthersChannels, socket]);

	return(
                <Row className="ScrollingList">
                        { MyChannels.length !== 0 
                                ? MyChannels.map(ButtonMyChannel)
                                : <div/>
                        }
                        { OthersChannels.length !== 0 
                                ? OthersChannels.map(ButtonOtherChannel)
                                : <div/>
                                
                        }
                </Row>
	)

}

export default ListChannel
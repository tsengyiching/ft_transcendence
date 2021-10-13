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

interface IChannel {
        channel_id: number,
        channel_name: string,
        channel_type: 'Private' | 'Public'
        role: 'Owner' | 'Admin' | 'User';
        status: 'Normal' | 'Mute' | 'Ban';
}

const MyChannel = (Channel: IChannel) => (
        <div>
                <Button className="MyChannel">
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
        </div>
        )

function ListChannel()
{
        let color = "warning";
        let number = 50;
        let socket = useContext(SocketContext);
        const [MyChannels, SetChannels] = useState<IChannel[]>([]);

        useEffect(() => {
                socket.on("channels-user-in", (data: IChannel[]) => SetChannels(data));
                console.log(MyChannels);
        }, [MyChannels, socket]);

	return(
                <Row className="ScrollingListChannel">
                        { MyChannels !== [] ?
                                MyChannels.map(
                                 MyChannel
                                ) :
                                <div className="NoChannel" > No Channel Joined</div>
                        }
                </Row>
	)

}

export default ListChannel
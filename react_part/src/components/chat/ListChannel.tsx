import React, { useState, useEffect, useContext } from "react"
import { Placeholder, Row, Button, Image } from "react-bootstrap"
import {SocketContext} from "../../context/socket"
import './ListChannel.css'
import PadlockImage from "../pictures/Padlock-symbol.png"
import GlobeImage from "../pictures/earth-globe-world-globe-drawing-sticker.jpeg"
import CrownImage from "../pictures/Crown.jpg"
import StarImage from "../pictures/star1.jpeg"
import MSNImage from "../pictures/people.jpeg"
import NormalImage from "../pictures/volume-on.png"
import MuteImage from "../pictures/volume-off.jpeg"
import BlockImage from "../pictures/redx.png"
import JoinChannelModal from "./JoinChannelModal"
import "./ListChannel.css"

interface IMyChannel {
        channel_id: number,
        channel_name: string,
        channel_type: 'Private' | 'Public'
        role: 'Owner' | 'Admin' | 'User';
        status: 'Normal' | 'Mute' | 'Ban';
}

export interface IOtherChannel {
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
        const [ShowJoinModal, setShowJoinModal] = useState(0);

        useEffect( () => { 
                socket.emit("ask-reload-channel");
                }, [])

        function ButtonMyChannel(Channel: IMyChannel) {
                let channel_id = Channel.channel_id;
                let channel_name = Channel.channel_name;
                
                return (
                <Button key={channel_id} className="ButtonChannel ButtonMyChannel " onClick={(e) => (props.setChannelSelected({channel_id, channel_name}))}>
                        {Channel.channel_type === 'Private' ?
                        <Image src={PadlockImage} className="LogoChannel" roundedCircle alt="padlock"/>
                        : <Image src={GlobeImage} className="LogoChannel" roundedCircle alt="globe"/>}
                        
                        {Channel.channel_name}
                        
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
                        
                </Button>
                )
        }

        function ButtonOtherChannel(Channel: IOtherChannel) {
                let channel_id = Channel.channel_id;
                let channel_name = Channel.channel_name;

                return (
                        <div key={channel_id}>
                        <Button  className="ButtonChannel ButtonOtherChannel" onClick={() => {setShowJoinModal(channel_id); console.log(channel_name)}}>
                                {Channel.channel_type === 'Private' ?
                                <Image src={PadlockImage} className="LogoChannel" roundedCircle alt="padlock"/>
                                : <Image src={GlobeImage} className="LogoChannel" roundedCircle alt="globe"/>}
                                {channel_name}
                        </Button>
                        <JoinChannelModal
                        show={ShowJoinModal === channel_id}
                        onHide={() => {setShowJoinModal(0); console.log(channel_name)}}
                        backdrop="static"
                        channel={Channel}
                        />
                        </div>
                )
        }


        useEffect(() => {
                socket.on("channels-user-in", (data: IMyChannel[]) => SetMyChannels(data));
                socket.on("channels-user-out", (data: IOtherChannel[]) => SetOthersChannels(data));
        }, [MyChannels, OthersChannels, socket]);

	return(
                <Row className="ScrollingListChannel">
                        <div className="ChannelsJoined">
                                Channels Joined:
                                { MyChannels.length !== 0 
                                        ? MyChannels.map(ButtonMyChannel)
                                        : <div/>
                                }
                        </div>
                        <div className="ChannelNotJoinded">
                                Channels not Joined:
                                { OthersChannels.length !== 0 
                                        ? OthersChannels.map(ButtonOtherChannel)
                                        : <div/>                
                                }
                        </div>
                </Row>
	)

}

export default ListChannel
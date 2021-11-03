import { Form, Button, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap'
import {useState, useContext, useEffect} from 'react'
import ChatChannel from './Talk';
import CreateChannelButton from './create_channel';
import ListChannel from "./ListChannel";
import ListMP from "./ListMP"
import DropdownListUser from './DropdownListUser';
import './InterfaceUser.css'
import {SocketContext} from '../../context/socket'
import InterfaceMembers from '../members/members';
import LeaveChannelButton from './LeaveChannelModal'

interface IChannel {
    channel_id: number,
    channel_name: string
}


function InterfaceUser() {

    const [channelradioValue, setchannelRadioValue] = useState('1');
    const [channelSelected, setChannelSelected] = useState<IChannel | undefined>();
    const socket = useContext(SocketContext);

    const channelradios = [
        {name: 'Channels', value: '1'},
        {name: 'private message', value: '2'},
    ]

    useEffect(() => {
        socket.on('channel-need-reload', () => socket.emit('ask-reload-channel'));
    }, [socket])

    function ResetChannel() { setChannelSelected(undefined)}

    function InterfaceChannel() {
        return (
        <Row>
        <ButtonGroup className="mb-2">
            {channelradios.map((radio, idx) => (
                <ToggleButton
                id={`channelradio-${idx}`}
                name="radio"
                key={idx % 2 ? 'channels' : 'private message'}
                type='radio'
                variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                value={radio.value}
                checked={channelradioValue === radio.value}
                onChange={(e) => setchannelRadioValue(e.currentTarget.value)}
                >
                    {radio.name}
                </ToggleButton>
            ))}
        </ButtonGroup>
        
        <Col lg={10}>
            {channelradioValue==='1' ? 
            <ListChannel channelSelected={channelSelected} setChannelSelected={setChannelSelected}/> 
            : <ListMP/>}
        </Col>
        <Col>
            {channelradioValue==='1' ? 
                <div>
                    <CreateChannelButton socketid={socket}/>
                    { channelSelected !== undefined ?
                        <LeaveChannelButton channel={channelSelected} CallBackFunction={ResetChannel} />
                    :   <Button disabled className="ButtonCreate bg-secondary"> Leave Channel</Button>}
                </div>
                : <button className="ButtonCreate bg-success"> Create Private Conversation </button>
            }
        </Col>
        </Row>
    )}

    function InterfaceChat() {
        return (
            <Row className="TitleChannel">
                    {channelSelected !== undefined
                    ? <h2 style={{height:"1.2em"}}> {channelSelected.channel_name} </h2>
                    : <h2 style={{height:"1.2em"}}></h2>}
                <Col lg={8}>
                    <ChatChannel/>
                    <Form className="FormSendMessage justify-content-center" style={{padding:"0px", paddingTop:"0.8em"}}>
                    <Form.Control type="name" placeholder="Message" />
                    {channelSelected !== undefined ? <Button type="submit" > Send </Button>
                    : <Button type="submit" disabled > Send </Button> }
                    </Form>
                </Col>
                <Col style={{height:"60em"}}>
                        <Button style={{width:"12.5em", borderRadius:"3em"}} variant={"secondary"}> Settings </Button>
                        <div style={{height:"40em"}}> list channel participants</div>
                </Col>
            </Row>
    )}

	return (
        <div>
        <Row as={InterfaceChannel}/>
        <Row>
          <Col className="ColumnChat" lg={{span: 8, offset: 0}} style={{borderRight:"1px solid #aaa", height: "48em"}}>
              <InterfaceChat/>
          </Col>
          <Col className="ColumnChat" lg={{span: 4, offset: 0}} >
            <InterfaceMembers />
          </Col>
        </Row>
        </div>
	);
}

export default InterfaceUser;
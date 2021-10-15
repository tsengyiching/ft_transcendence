import React, { useState, useContext } from "react";
import { Button, Modal, Form, } from "react-bootstrap";
import {SocketContext} from "../../context/socket"
import {IOtherChannel} from "./ListChannel"

interface Props {
  show: boolean,
  onHide: () => void,
  backdrop: string,
  channel: IOtherChannel,
}

function JoinChannelModal(props: Props) {

    const [password, setPassword] = useState("");
    const socket = useContext(SocketContext);

    function SubmitForm(event: any) {
      event.preventDefault();
      let data = {password: password};
      socket.emit('channel-join', data);
      onHide();
    }

    function onHide(){
      setPassword("");
      props.onHide();
    }

    function ChangePassword(e: React.ChangeEvent<HTMLInputElement>) { setPassword(e.currentTarget.value);}

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Do you want to join channel {props.channel.channel_name} ?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {
        props.channel.channel_type === 'Private' ?
        <Form>
          <Form.Label> Password </Form.Label>
          <Form.Control type="password" value={password} name="password" placeholder="Enter the password pls" onChange={ChangePassword} />
        </Form>
        : <div></div>
      }
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide} >
            Yes
        </Button>
        <Button variant="secondary" onClick={onHide}>
            No
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default JoinChannelModal;
import React, { useState } from "react";
import { Button, Modal, ToggleButton, ButtonGroup, ToggleButtonGroup, Form} from "react-bootstrap";

interface Props {
  show: boolean,
  onHide: () => void,
  backdrop: string,
}

function CreateChannelModal(props: Props) {

    const [passwordLock, setPasswordLock] = useState(true);

    function PrintPassword() {
      if (passwordLock)
      {
        return (
        <Form className="w-50 p-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" readOnly/>
        </Form>
        )
      }
      else
      {
        return (
        <Form className="w-50 p-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password"/>
        </Form>
        )
      }
    }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Create Channel
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="w-50 p-3">
          <Form.Label> Channel Name </Form.Label>
          <Form.Control type="channelName" placeholder="Channel Name"/>
        </Form>
        <ToggleButtonGroup name='typeChannel' className="mb-2" defaultValue={1} type='radio'>
            <ToggleButton value ={1} id="publicChannel" type='radio' variant="primary" onClick={() => {setPasswordLock(true)}}>
              Public Channel
            </ToggleButton>
            <ToggleButton value={2} id="privateChannel" type='radio' variant="primary" onClick={() => {setPasswordLock(false)}}>
              Private Channel
            </ToggleButton>
        </ToggleButtonGroup>
        <PrintPassword />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" type="submit" onClick={props.onHide}>
            Create Channel
        </Button>
        <Button variant="secondary" onClick={props.onHide}>
            Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function CreateChannelButton() {
  const [modalShow, setModalShow] = React.useState(false);

  return (
    <React.Fragment>
      <Button variant="primary" onClick={() => setModalShow(true)}>
        Create Channel
      </Button>
      <CreateChannelModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        backdrop="static"
      />
    </React.Fragment>
  )
}

export default CreateChannelButton;
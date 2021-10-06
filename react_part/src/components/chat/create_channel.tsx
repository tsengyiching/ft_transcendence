import React, { useState } from "react";
import { Button, Modal, ToggleButton, ToggleButtonGroup, Form, } from "react-bootstrap";

interface Props {
  show: boolean,
  onHide: () => void,
  backdrop: string,
}

function CreateChannelModal(props: Props) {

    const [passwordLock, setPasswordLock] = useState(true);
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    function SubmitForm(event: any) {
  event.preventDefault();
  console.log(name);
  console.log(password);
}

    function ChangeName(e: React.ChangeEvent<HTMLInputElement>) { setName(e.currentTarget.value);}
    function ChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
      if (passwordLock)
        setPassword("");
      else
        setPassword(e.currentTarget.value);}

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
        <Form className="w-50 p-3 " onSubmit={SubmitForm} >
          <ToggleButtonGroup name='typeChannel' className="mb-3" defaultValue={"public"} type='radio'>
            <ToggleButton value ={"public"} id="publicChannel" type='radio' variant="primary" onClick={() => {setPasswordLock(true); setPassword("")}}>
              Public Channel
            </ToggleButton>
            <ToggleButton value={"private"} id="privateChannel" type='radio' variant="primary" onClick={() => {setPasswordLock(false)}}>
              Private Channel
            </ToggleButton>
          </ToggleButtonGroup>
          <Form.Label> Channel Name </Form.Label>
          <Form.Control type="text" name="name" placeholder="Channel Name" className="mb-4" onChange={ChangeName}/>
          <Form.Label>
            Password
          </Form.Label>
          <Form.Control type="password" className="mb-3" value={password} name="password" placeholder="Password (only for private)" onChange={ChangePassword} />
          <Button variant="success" type="submit" onClick={props.onHide}>
              Create Channel
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
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
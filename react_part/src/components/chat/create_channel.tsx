import React, { useState } from "react";
import { Button, Modal, ToggleButton, ToggleButtonGroup, Form} from "react-bootstrap";

interface Props {
  show: boolean,
  onHide: () => void,
  backdrop: string,
}

function CreateChannelModal(props: Props) {

    const [passwordShow, setPasswordShow] = React.useState(false);
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
        <ToggleButtonGroup type="checkbox" defaultValue={[1, 2]}
            className="mb-2">
            <ToggleButton id="publicChannel" value={1} variant="primary">
              Public Channel
            </ToggleButton>
            <ToggleButton id="privateChannel" value={2} variant="primary">
              Private Channel
            </ToggleButton>
          </ToggleButtonGroup>
            {/*<Form>
              <Form.Control type="text" readOnly>
                Password
              </Form.Control>
            </Form>*/}
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
import { Form, Button } from 'react-bootstrap'

function Parametre () {
    return (
        <div>
            <div className="row">
                <div className="col">
                    <div className="row">
                        <div className="row w-50 p-3">
                            <h4>Changer de pseudo : </h4>
                            <Form className="">
                                <Form.Control type="name" placeholder="Pseudo"/>
                                <Button type="submit">valider</Button>
                            </Form>
                        </div>
                        <div className="row w-50 p-3">
                            <h4>Changer de photo : </h4>
                            <Form className="">
                                <Form.Control type="name" placeholder="Lien de la photo"/>
                                <Button type="submit">valider</Button>
                            </Form>
                        </div>
                        <div className="row w-50 p-3">
                            <h4>Activer le double authentificateur : </h4>
                            <Form className="w-25 p-3">
                                <Button type="submit">activer</Button>
                            </Form>
                        </div>
                    </div>
                </div>
                <div className="col">
                    
                </div>
            </div>
        </div>
    )
}

export default Parametre;
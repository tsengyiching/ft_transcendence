import {Form, Button, Row} from 'react-bootstrap'

function Friend(props: {name: string, link_profile: string, link_picture: string, link_status: string, status_alt: string}) {
	return (
        <div className="col col-lg-2">
            <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand" href={props.link_profile}>
                     <img src={props.link_picture} width="30" height="30" alt=""/>
                    {props.name}
                    <img src={props.link_status} className="img-fluid" alt={props.status_alt} width="20"/>
                </a>
            </nav>
        </div>
	)
}

function Friends() {
	return (
            <Row>
				<Friend name="Bobek" link_profile="/profile" link_picture="https://cdn.futura-sciences.com/buildsv6/images/wide1920/4/a/0/4a02bf6947_50161932_gorille-coronavirus.jpg"
					link_status="https://upload.wikimedia.org/wikipedia/commons/a/a0/Rond_orange.png" status_alt="orange circle" />
				<Friend name="Martine" link_profile="/" link_picture="https://media.routard.com/image/24/9/pt72050.1281249.w430.jpg"
					link_status="https://www.png-gratuit.com/img/cercle-vert-fond-transparent.png" status_alt="green circle" />
				<Friend name="Babar" link_profile="/" link_picture="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKn2GIAH7auDdHRpZmNWQTzwAgZd-rWGynlg&usqp=CAU"
					link_status="https://www.png-gratuit.com/img/cercle-rouge-fond-transparent.png" status_alt="red circle" />
				<AddFriend />
            </Row>
    )
}

function AddFriend() {
	return (
        <div className="d-flex justify-content-center">
            <Form className="w-50 p-3">
                <Form.Label>Ajouter un ami</Form.Label>
                <Form.Control type="name" placeholder="" />
                <Button type="submit">ajouter</Button>
            </Form>
        </div>
	);
}

export default Friends;
import React from 'react'
import "./Header.css"

import axios from 'axios';
import { useEffect, useState} from "react";
import { Image } from "react-bootstrap";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';


function Header () {
    const [isConnected, setConnexion] = useState(true);
    const [user_avatar, setAvatar] = useState("")
    const [id, setId] = useState(0);
	const [nick, setNick] = useState<string>('');

    useEffect(() => {
        axios.get('http://localhost:8080/profile/me/',{
            withCredentials:true,
        })
        .then(res => {
            setId(res.data.id);
            setAvatar(res.data.avatar)
			setNick(res.data.nickname)
            setConnexion(true);
        })
        .catch(res => {
            setConnexion(false);
        })
    }, []);
    
    if (isConnected)
    { // https://cdn-icons.flaticon.com/png/128/3322/premium/3322434.png?token=exp=1636118252~hmac=d6b9c64cb59fc8fcdd055bbebc86fbb8
		return (
		<Navbar collapseOnSelect bg="light" style={{fontSize:'20px'}}>
			<Container fluid>
    		<Navbar.Brand style={{paddingLeft:"50px", fontSize:'30px'}} href="/accueil">
				<Image src={process.env.PUBLIC_URL + '/ping-pong.png'} style={{position:'relative', marginBottom:'6px', marginRight:'10px'}} width="40" height="40" alt="" />
			Pong
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Nav>
			<Nav.Item>
    			<Nav.Link href="/home">Ladder</Nav.Link>
  			</Nav.Item>
			</Nav>
    		<Navbar.Collapse className="justify-content-end" >
			<Nav>
    		<Nav.Link href={'/profile/'+id}>{nick}</Nav.Link>
			</Nav>
      		<Nav style={{paddingRight:"5px"}}>
			  <Nav.Item>
        			<NavDropdown title={<Image src={`${user_avatar}`} style={{width:"60px", height:"60px", objectFit:'cover', objectPosition:'center'}} alt="pp" roundedCircle fluid/>}  align="end" id="basic-nav-dropdown">
        				<NavDropdown.Item href={'/profile/'+id}>Profile</NavDropdown.Item>
          				<NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
						<NavDropdown.Divider />
        				<NavDropdown.Item href="/auth/disconnect">Logout</NavDropdown.Item>
        			</NavDropdown>
					</Nav.Item>
      		</Nav>
			</Navbar.Collapse>
			</Container>
		</Navbar>
		)

    }
    else {
        return (
			<Navbar collapseOnSelect bg="light" style={{fontSize:'20px'}}>
			<Container fluid>
    		<Navbar.Brand style={{paddingLeft:"50px", fontSize:'30px'}} href="/accueil">
				<Image src={process.env.PUBLIC_URL + '/ping-pong.png'} style={{position:'relative', marginBottom:'6px', marginRight:'10px'}} width="40" height="40" alt="" />
			Pong
			</Navbar.Brand>
			<Navbar.Collapse className="justify-content-end" >
			<Nav style={{paddingRight:'10px'}}>
    		<Nav.Link href="http://localhost:8080/auth/login/">Log in</Nav.Link>
			</Nav>
			</Navbar.Collapse>

			</Container>
		</Navbar>
        )
    }
}
// /connexion
export default Header;

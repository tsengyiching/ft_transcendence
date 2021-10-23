import { useEffect, useState } from 'react'
import {Row} from 'react-bootstrap'
import './Friends.css'



export default function Friends() {

	const [FriendList, setFriendList] = useState([])

	useEffect(() => {

	}, [FriendList])
	return ( 
		<Row>
			Friends
		</Row>
	)
}
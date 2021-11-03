import { Image } from 'react-bootstrap'
import './Status.css'
import GreenCercle from '../pictures/cercle-vert-fond-transparent.png'
import OrangeCercle from '../pictures/cercle-orange-fond-transparent.png'
import RedCercle from '../pictures/cercle-rouge-fond-transparent.png'

type StatusType = 'Available' | 'Playing' | 'Offline';

function status(status: StatusType)
{
	const color = (status === 'Available') ? GreenCercle
		: (status === 'Playing') ? OrangeCercle
		: RedCercle;

	return (
		<Image 	src={color} rounded className="StatusCircle"/>
	)
}

export default status;
import { Image } from 'react-bootstrap'
import './Status.css'

function status(status: 'Available' | 'Playing' | 'Offline')
{
	const color = (status === 'Available') ? 'https://www.png-gratuit.com/img/cercle-vert-fond-transparent.png'
		: (status === 'Playing') ? 'https://www.png-gratuit.com/img/cercle-orange-fond-transparent.png'
		: 'https://www.png-gratuit.com/img/cercle-rouge-fond-transparent.png';

	return (
		<Image 	src={color} rounded className="StatusCircle"/>
	)
}

export default status;
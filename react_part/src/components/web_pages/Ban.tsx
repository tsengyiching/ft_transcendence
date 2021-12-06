import './Ban.css'
import {Image} from 'react-bootstrap'
import BannedSymbol from './pictures/banned-symbole.png'

export default function Ban()
{
	return (
		<div className="Ban" >
			<Image src={BannedSymbol} fluid style={{marginRight: "10%"}} />
			YOU ARE BANNED
		</div>
	)
}
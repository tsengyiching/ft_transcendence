import {useEffect, useState} from "react"
import {Paddle, Ball, Pos} from '../../types/ObjectTypes'
import useStore  from '../../hooks/useStore'

const BonusHandler:React.VFC<{}> = () => {
	const [frame, setFrame] = useState<number>(0);
	const leftUp = useStore(s => s.BonusLeft.up);
	useEffect(() => {
		const timer = setTimeout(() => {
			if (frame < 20) {
				setFrame(f => f + 1);
				if (leftUp) {
					useStore.setState(s => ({...s, radius: s.radius + (Math.floor(frame / 10) % 2 === 0 ? 2 : -2 )}));
				}
			
			}
			else if (!leftUp) {
				setFrame(0);
				if (Math.random() < 0.5)
				{
					useStore.setState(s => ({...s, BonusLeft:{...s.BonusLeft, up: true, id: Math.floor(Math.random() * 3), y: Math.floor(Math.random() * s.h)}}));
				}
			}
			else {
				setFrame(0);
				useStore.setState(s => ({...s, radius: 2}));
				useStore.setState(s => ({...s, BonusLeft:{...s.BonusLeft, up: false, id: 0, y: 0}}));
			}
		}, 100); // changer cette valeur permet de render + ou - vite

		return () => clearTimeout(timer);
	});

	return null;
}

export default BonusHandler
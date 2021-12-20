import useStore from './../hooks/useStore'
import { useMediaQuery } from 'react-responsive'


const ResizeGame:React.FC<{}> = () => {
	const set = useStore.setState;
    const w = useStore(s => s.w);
    const handleMediaQueryChange = (matches:boolean) => {
        if (!matches && w !== 750) {
        set(s => ({...s,
            h: 800 *0.75 * 0.9,
            w: 1000 * 0.75,
            scoreBar: {
                ...s.scoreBar,
                h: 800 *0.75 * 0.1,
                w : 1000*0.75,
            }
			}));}

            else if (matches && w!== 1000){
                set(s => ({...s,
                    h: 800 * 0.9,
                    w: 1000,
                    scoreBar: {
                        ...s.scoreBar,
                        h: 800 * 0.1,
                        w : 1000,
                    }
                    }));
            }
          }
      
        const handleLittle = (matches:boolean) => {
            if (!matches && w !== 500) {
                set(s => ({...s,
                h: 800 *0.5 * 0.9,
                w: 1000 * 0.5,
                scoreBar: {
                    ...s.scoreBar,
                    h: 800 *0.5 * 0.1,
                    w : 1000*0.5,
                }
                }))
            ;}
            else if (matches && w!== 750){
                set(s => ({...s,
                    h: 800 * 0.75* 0.9,
                    w: 1000* 0.75,
                    scoreBar: {
                        ...s.scoreBar,
                        h: 800 * 0.75* 0.1,
                        w : 1000* 0.75,
                    }
                    }));
            }
        }
  
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isBig = useMediaQuery(
        { minWidth: 1200 }, undefined,  handleMediaQueryChange
      );
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isDesktopOrLaptop = useMediaQuery(
        { minWidth: 780 }, undefined,  handleLittle
      );

	

return null;}

export default ResizeGame
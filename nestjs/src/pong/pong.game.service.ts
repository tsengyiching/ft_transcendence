import { Injectable } from '@nestjs/common';
import {Ball, Paddle, Player, ObjectToCollide, Party} from './pong.interface';
import {XR, XL, Y, LEFTMAXANGLE, LEFTLITTLEANGLE, RIGHTMAXANGLE, RIGHTLITTLEANGLE, H, W, FRAMERATE} from './pong.env'

@Injectable()
export class PongService {
    private parties:Party[] = [];

    getPartById(id:number) {
        return this.parties[id];
    }
    
    private setNewParty(p1:Player, p2:Player): Party {
        let newParty:Party = {
            ball : {pos: {x: W * 0.5 , y: H * 0.5},
                radius: 15,
                vx: Math.random() > 0.5 ? 1 : - 1,
                vy: 0,
                speed:2,
                acceleration: 1,
            },
            paddleL : {
                h: H / 6,
                w: W * 0.02,
                pos:{
                    x: W * 0.01,
                    y: 0 
                },
                speed: 10 //TODO
            },
            paddleR :{
                h: H / 6,
                w: W * 0.02,
                pos:{
                    x: W * 0.97,
                    y: H -  (H / 6)
                },
                speed: 10 // TODO
            },
            scoreL: 0,
            scoreR: 0,
            lastp: false,
            lasty: false,
            pOne:p1,
            pTwo:p2,
        };
        return newParty; 
    }
    /**
     * 
     * @param pOne player one, gets left paddle
     * @param pTwo player two, gets right paddle
     * @returns id of the party ??(voir avec Felix) // TODO 
     */
    createNewParty(pOne:Player, pTwo:Player) {
        this.parties.push(this.setNewParty(pOne, pTwo));
        return (this.parties.length - 1); // return l'id de la partie TODO
    }
}

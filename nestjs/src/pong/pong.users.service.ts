import { Injectable } from '@nestjs/common';

@Injectable()
export class PongUsersService {
  private inMatchMaking: number[] = [];
  private isConnected: number[] = [];
  private check:boolean = false;

  isInMatchmaking(id: number): boolean {
    const found = this.inMatchMaking.find((e) => e === id);
    return found ? true : false;
  }
  addNewPlayer(id: number): boolean {
    if (!this.isInMatchmaking(id)) {
      this.inMatchMaking.push(id);
      return false;
    }
    return true;
  }

  removePlayer(id: number) {
    const found = this.inMatchMaking.indexOf(id);
    if (found !== -1) {
      this.inMatchMaking.splice(found, 1);
    }
  }

  userConnect(id: number) {
    if (!this.isConnected[id]) this.isConnected[id] = 0;
    this.isConnected[id] += 1;
  }

  userDisconnect(id: number): number {
    this.isConnected[id] -= 1;
    return this.isConnected[id];
  }

  nbWindowForUser(id: number): number {
    return this.isConnected[id];
  }

  makeMatchMaking():any {
	  const len = this.inMatchMaking.length;
	  let ret:number[] =[];
 	  if (len === 2)
	  {
		  // enlever les users du tableau et renvoyer une copie du tableau
		ret = this.inMatchMaking;
		this.inMatchMaking = [];
		return ret;
	  }
	  else if (len > 2) {
		  // enlever les 2 users du tableau
		  for (let i:number=0; i < 2; i++){
		    let index = Math.round(Math.random() * this.inMatchMaking.length);
			console.log(this.inMatchMaking);
		    ret.push(this.inMatchMaking[index]);
		    this.inMatchMaking.splice(index, 1);
		  }
		  return ret;
		///// make matchmaking avec random / selon ex parties / lvl
		// return le tableau de 2 id
	  }
	  else
	  	return NaN;

  }
}

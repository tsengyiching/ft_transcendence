import { Injectable } from '@nestjs/common';

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}  

@Injectable()
export class PongUsersService {
  private inMatchMaking: number[] = [];
  private isConnected: number[] = [];
  private gameid: number = 0;

  isInMatchmaking(id: number): boolean {
    return this.inMatchMaking.includes(id);
  }

  addNewPlayer(id: number) {
    if (!this.isInMatchmaking(id))
      this.inMatchMaking.push(id);
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
	  // attendre 10 sec pour lancer le matchmaking // return un tableau d'id des 2 users qui entrent dans la game et envoie un socket a ces 2 id 
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
			console.log('MATCH', this.inMatchMaking);
		    let index = Math.round(Math.random() * this.inMatchMaking.length);
			if (!this.inMatchMaking[index])
			{
				if (i == 1)
					this.addNewPlayer(ret[0]);
				return NaN
			}
		    ret.push(this.inMatchMaking[index]);
		    this.inMatchMaking.splice(index, 1);
		  }
		  return ret;
		///// make matchmaking avec random / selon ex parties / lvl
		// return le tableau de 2 id
	  }
	  else{
	  	return NaN;
	  }
  }

  createGameId():number {
	  return this.gameid++;
  }
}

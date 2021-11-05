import { Injectable } from '@nestjs/common';

@Injectable()
export class PongUsersService {
  private inMatchMaking: number[] = [];
  private isConnected: number[] = [];

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
    this.isConnected[id] += 1;
  }

  userDisconnect(id: number): number {
    this.isConnected[id] -= 1;
    return this.isConnected[id];
  }

  nbWindowForUser(id: number): number {
    return this.isConnected[id];
  }
}

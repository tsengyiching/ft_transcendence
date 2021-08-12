import { Injectable } from '@nestjs/common';
import { Game } from './game.model';

@Injectable()
export class GameService {
    private games: Game[] = [];
    
    createGame() {
        const gameId = (this.games.length + 1).toString();
        const newGame = new Game(gameId, "normal", 1, 2, 0, 0);
        this.games.push(newGame);
        return gameId;
    }

    getGame() {
        return this.games;
    }
}

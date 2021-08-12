import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private readonly games: GameService) {}
    
    @Get()
    public async showGame() {
        this.games.createGame();
        return this.games.getGame();
    }
}

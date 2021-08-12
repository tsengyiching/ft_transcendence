export class Game {
    constructor (
        public id: string,
        public type: string,
        public idPlayer1: number,
        public idPlayer2: number,
        public scorePlayer1: number,
        public scorePlayer2: number
    ) {}
}
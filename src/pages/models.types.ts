export type GameDTO = {
    id: string;
    name: string;
    turn: number;
    players: PlayerDTO[];
    drawPile: number[];
    createTime: Date;
}

export type PlayerDTO = {
    name: string;
    hand: number[];
    points: number;
}

export type CardDTO = {
    suit: string;
    rank: string;
}
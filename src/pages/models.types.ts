export type GameDTO = {
    log: action[];
    id: string;
    name: string;
    turn: number;
    players: PlayerDTO[];
    drawPile: number[];
    createTime: Date;
    admin: string;
}

export type action = {
    action: string;
    timestamp: Date;
}

export type PlayerDTO = {
    name: string;
    hand: number[];
    score: number;
}

export type CardDTO = {
    suit: string;
    rank: string;
}
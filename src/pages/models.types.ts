export type GameDTO = {
    log: action[];
    id: string;
    name: string;
    turn: number;
    players: PlayerDTO[];
    drawPile:  (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    createTime: Date;
    admin: string;
}

export type action = {
    action: string;
    timestamp: Date;
}

export type PlayerDTO = {
    name: string;
    hand:  (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    score: number;
    isProtected: boolean;
}

export type CardDTO = {
    number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    name: string;
    description: string;
    count: number;
}

export const cardInfo = new Map<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, CardDTO>([
    [1, {number: 1, name: "Guard", description: "Name an other player and guess what card they currently have (not possible to guess guard). If you are correct, they are eliminated.", count: 6}],
    [2, {number: 2, name: "Priest", description: "Look at the card in another player’s hand.", count: 2}],
    [3, {number: 3, name: "Baron", description: "Compare the value of the remaining card in your hand with an another player’s card. The player with the lower-value card is eliminated.", count: 2}],
    [4, {number: 4, name: "Maid", description: "Card abilities do not affect you until the start of your next turn.", count: 2}],
    [5, {number: 5, name: "Prince", description: "Force any player to discard the card in their hand. They do not perform the card’s action. They immediately draw a new card.", count: 2}],
    [6, {number: 6, name: "Counselor", description: "Draw two cards from the deck into your hand. Choose and keep one of the three cards now in your hand, and place the other two on the bottom of the deck in any order.", count: 2}],
    [7, {number: 7, name: "King", description: "Swap the remaining card in your hand with another player.", count: 1}],
    [8, {number: 8, name: "Countess", description: "You must discard the Countess if the King or Prince is the other card in your hand. The card has no effect when played", count: 1}],
    [9, {number: 9, name: "Princess", description: "You are immediately eliminated if you discard the Princess.", count: 1}],
]);
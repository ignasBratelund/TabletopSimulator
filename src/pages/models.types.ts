
import guardCard from "../images/guard-card.png";
import priestCard from "../images/priest-card.png";
import baronCard from "../images/baron-card.png";
import maidCard from "../images/maid-card.png";
import princeCard from "../images/prince-card.png";
import councilorCard from "../images/councilor-card.png";
import kingCard from "../images/king-card.png";
import countessCard from "../images/countess-card.png";
import princessCard from "../images/princess-card.png";

export type GameDTO = {
    log: message[];
    id: string;
    name: string;
    turn: number;
    players: PlayerDTO[];
    drawPile:  (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    createTime: Date;
    admin: string;
}

export type message = {
    message: string;
    timestamp: Date;
    sendingPlayer: string | null;
    receivingPlayers: string[];
}

export type PlayerDTO = {
    name: string;
    hand:  (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
    score: number;
    isProtected: boolean;
    color: string;
}

export type CardDTO = {
    number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    name: string;
    description: string;
    count: number;
    image: string;
}

export const cardInfo = new Map<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, CardDTO>([
    [1, {number: 1, name: "Guard", description: "Name an other player and guess what card they currently have (not possible to guess guard). If you are correct, they are eliminated.", count: 6, image: guardCard}],
    [2, {number: 2, name: "Priest", description: "Look at the card in another player’s hand.", count: 2, image: priestCard}],
    [3, {number: 3, name: "Baron", description: "Compare the value of the remaining card in your hand with an another player’s card. The player with the lower-value card is eliminated.", count: 2, image: baronCard}],
    [4, {number: 4, name: "Maid", description: "Card abilities do not affect you until the start of your next turn.", count: 2, image: maidCard}],
    [5, {number: 5, name: "Prince", description: "Force any player to discard the card in their hand. They do not perform the card’s action. They immediately draw a new card.", count: 2, image: princeCard}],
    [6, {number: 6, name: "Counselor", description: "Draw two cards from the deck into your hand. Choose and keep one of the three cards now in your hand, and place the other two on the bottom of the deck in any order.", count: 2, image: councilorCard}],
    [7, {number: 7, name: "King", description: "Swap the remaining card in your hand with another player.", count: 1, image: kingCard}],
    [8, {number: 8, name: "Countess", description: "You must discard the Countess if the King or Prince is the other card in your hand. The card has no effect when played", count: 1, image: countessCard}],
    [9, {number: 9, name: "Princess", description: "You are immediately eliminated if you discard the Princess.", count: 1, image: princessCard}],
]);
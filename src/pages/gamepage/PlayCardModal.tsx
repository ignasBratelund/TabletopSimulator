import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl, InputLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import {usePlayerName} from "../usePlayerName";
import {CardDTO, CardInfo, CardNumber, GameDTO} from "../models.types";
import {updateGame} from "../useFirestore";
import {getIsPlayersTurn, getPlayer, getPlayerIndex} from "./GamePage";

const cardsWithOpponent = [1, 2, 3, 5, 7];
const cardsMinusGuard = [2, 3, 4, 5, 6, 7, 8, 9] as (CardNumber)[];

export function incrementTurn(game: GameDTO){
    if (game.players.filter(player => player.hand.length > 0).length >= 2){
        for (let i = 1; i < game.players.length + 1; i++){
            if (game.players[(game.turn + i) % game.players.length].hand.length > 0){
                game.turn = (game.turn + i) % game.players.length;
                break;
            }
        }
        game.players[game.turn].isProtected = false;
        if(game.drawPile.length > 1 && game.players[game.turn].hand.length === 1){
            game.players[game.turn].hand.push(game.drawPile.pop()!);
        } else {
            game.turn = -1;
            let leadingPlayersIndex = [-1];
            for (let i = 0; i < game.players.length; i++){
                if (game.players[i].hand.length > 0){
                    game.log.push({message: game.players[i].name + " has a " + game.players[i].hand, timestamp: new Date(), sendingPlayer:null, receivingPlayers: game.players.map(p => p.name)});
                    if (leadingPlayersIndex[0] === -1){
                        leadingPlayersIndex = [i];
                    } else {
                        if (game.players[i].hand[0] > game.players[leadingPlayersIndex[0]].hand[0]){
                            leadingPlayersIndex = [i];
                        } else if (game.players[i].hand[0] === game.players[leadingPlayersIndex[0]].hand[0]){
                            leadingPlayersIndex.push(i);
                        }
                    }
                }
            }
            if (leadingPlayersIndex.length === 1){
                game.log.push({message: game.players[leadingPlayersIndex[0]].name + " won the round", timestamp: new Date(), sendingPlayer:null, receivingPlayers: game.players.map(p => p.name)});
                game.players[leadingPlayersIndex[0]].score += 1;
            }
            else {
                game.log.push({message: "The round was a tie between " + leadingPlayersIndex.map(i => game.players[i].name).join(", "), timestamp: new Date(), sendingPlayer:null, receivingPlayers: game.players.map(p => p.name)});
                for (let i = 0; i < leadingPlayersIndex.length; i++){
                    game.players[leadingPlayersIndex[i]].score += 1;
                }
            }
        }
    } else {
        game.turn = -1;
        let winningPlayerIndex = -1;
        for (let i = 0; i < game.players.length; i++){
            if (game.players[i].hand.length > 0){
                winningPlayerIndex = i;
                break;
            }
        }
        game.log.push({message: game.players[winningPlayerIndex].name + " won the round", timestamp: new Date(), sendingPlayer:null, receivingPlayers: game.players.map(p => p.name)});
        game.players[winningPlayerIndex].score += 1;
    }
}

function removeCardFromHand(game: GameDTO, playerName: string | null, card: CardNumber){
    if (playerName){
        for (let i = 0; i < game.players.length; i++){
            if (game.players[i].name === playerName){
                for (let j = 0; j < game.players[i].hand.length; j++){
                    if (game.players[i].hand[j] === card){
                        game.players[i].hand.splice(j, 1);
                        return;
                    }
                }
            }
        }
    }
}

function replaceCardFromHand(game: GameDTO, playerName: string | null, card: CardNumber, newCard: CardNumber){
    if (playerName){
        for (let i = 0; i < game.players.length; i++){
            if (game.players[i].name === playerName){
                for (let j = 0; j < game.players[i].hand.length; j++){
                    if (game.players[i].hand[j] === card){
                        game.players[i].hand[j] = newCard;
                        return;
                    }
                }
            }
        }
    }
}

function getOtherCardInHand(game: GameDTO, playerName: string | null, card: CardNumber){
    if (playerName){
        for (let i = 0; i < game.players.length; i++){
            if (game.players[i].name === playerName){
                if (game.players[i].hand.length === 2){
                    return game.players[i].hand[0] === card ? game.players[i].hand[1] : game.players[i].hand[0];
                }
            }
        }
    }
    console.log("No other card error")
    return -1;
}

export function arrayEquals(a: any[], b: any[], ignoreOrdering: boolean){
    if(a.length !== b.length){
        return false;
    }
    const aCopy = a.slice();
    const bCopy = b.slice();
    if (ignoreOrdering){
        aCopy.sort();
        bCopy.sort();
    }
    for (let i = 0; i < aCopy.length; i++){
        if (aCopy[i] !== bCopy[i]){
            return false;
        }
    }
    return true;
}

function resolveCard(game: GameDTO, setCard:  React.Dispatch<React.SetStateAction<CardDTO | undefined>>, card: CardDTO, selectedCard: (CardNumber | -1), selectedOpponent: string, playerName: string | null, setError: React.Dispatch<React.SetStateAction<string>>, selectedCouncilorCards: (CardNumber | -1)[], possibleCouncilorCards: CardNumber[]){
    setError("")

    // no opponent override
    if (cardsWithOpponent.includes(card.number) && card.number !== 5 && game.players.filter(player => player.hand.length > 0 && !player.isProtected).length === 1){
        removeCardFromHand(game, playerName, card.number);
        game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " to no effect.", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
        incrementTurn(game);
        updateGame(game.id,game);
        setCard(undefined);
        return;
    }

    if (cardsWithOpponent.includes(card.number)){
        if (selectedOpponent === ""){
            setError("Please select an opponent");
            return;
        }
        if (getPlayer(game, selectedOpponent)?.isProtected){
            setError("Selected player is protected and can not be selected");
            return;
        }
    }
    //Guard
    if (card.number === 1){
        if (selectedCard === -1){
            setError("Please select a card");
            return;
        }
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                if (game.players[i].hand[0] === selectedCard){
                    game.players[i].hand = [];
                    game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and guessed correctly that " + game.players[i].name + " had a " + CardInfo.get(selectedCard)?.name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                } else {
                    game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and guessed incorrectly that " + game.players[i].name + " had a " + CardInfo.get(selectedCard)?.name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                }
            }
        }
        removeCardFromHand(game, playerName, card.number);
    }
    //Priest
    if (card.number === 2){
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and looked at " + game.players[i].name + "'s hand.", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                game.log.push({message: game.players[i].name + "'s hand: " + CardInfo.get(game.players[i].hand[0])?.name, timestamp: new Date(), sendingPlayer:null, receivingPlayers: [playerName!]});
            }
        }
        removeCardFromHand(game, playerName, card.number);
    }
    //Baron
    if (card.number === 3){
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                removeCardFromHand(game, playerName, card.number);
                if (game.players[i].hand[0] < getPlayer(game, playerName)?.hand[0]!){
                    game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and won the duel against " + game.players[i].name + ". " + game.players[i].name + " had a " + CardInfo.get(game.players[i].hand[0])?.name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                    game.players[i].hand = [];

                } else if (game.players[i].hand[0] > getPlayer(game, playerName)?.hand[0]!){
                    game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and lost the duel against " + game.players[i].name + ". " + getPlayer(game, playerName)?.name + " had a " + CardInfo.get(getPlayer(game, playerName)?.hand[0]!)?.name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                    game.players[getPlayerIndex(game, playerName)].hand = [];
                } else {
                    game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and tied the duel against " + game.players[i].name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                }
            }
        }
    }
    //Maid
    if (card.number === 4){
        game.players[getPlayerIndex(game, playerName)].isProtected = true;
        game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and protected themselves until their next turn.", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
        removeCardFromHand(game, playerName, card.number);
    }
    //Prince
    if (card.number === 5){
        removeCardFromHand(game, playerName, card.number);
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and forced " + game.players[i].name + " to discard their " + CardInfo.get(game.players[i].hand[0])?.name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                if (game.players[i].hand.pop() !== 9){
                    game.players[i].hand.push(game.drawPile.pop()!);
                }
            }
        }
    }
    //Councilor
    if (card.number === 6){
        if (game.drawPile.length === 1){
            game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " to no effect.", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
            removeCardFromHand(game, playerName, card.number);
        } else {
            replaceCardFromHand(game, playerName, card.number, -6);
            setCard(CardInfo.get(-6));
            updateGame(game.id,game);
            return;
        }
    }
    if (card.number === -6){
        if(selectedCouncilorCards.includes(-1) || !arrayEquals(selectedCouncilorCards, possibleCouncilorCards, true)){
            setError("Please select a card for each slot, only using each card once");
            return
        }
        const extraCard = game.drawPile.shift();
        for (let i = 0; i < selectedCouncilorCards.length; i++){
            if (i===0){
                game.players[getPlayerIndex(game, playerName)].hand = [selectedCouncilorCards[0]] as CardNumber[];
            }
            if (i>=1){
                game.drawPile.pop();
                game.drawPile.unshift(selectedCouncilorCards[i] as CardNumber);
            }
        }
        game.drawPile.unshift(extraCard!);
        game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
        let lastCardsMessage
        if (game.drawPile.length > 3){
            lastCardsMessage = "The card on the bottom and the second card from the bottom are now respectively " + game.drawPile[game.drawPile.length - 2] + " and " + game.drawPile[game.drawPile.length - 3] + ".";
        }
        else {
            lastCardsMessage = "The card on the bottom is now " + game.drawPile[game.drawPile.length - 2] + ".";
        }
        if (lastCardsMessage){
            game.log.push({message: lastCardsMessage, timestamp: new Date(), sendingPlayer:null, receivingPlayers: [playerName!]});
        }
    }
    //King
    if (card.number === 7){
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and swapped hands with " + game.players[i].name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
                removeCardFromHand(game, playerName, card.number);
                const temp = game.players[i].hand;
                game.players[i].hand = game.players[getPlayerIndex(game, playerName)].hand;
                game.players[getPlayerIndex(game, playerName)].hand = temp;
            }
        }
    }
    //Countess
    if ([8].includes(card.number)){
        game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " to no effect.", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
        removeCardFromHand(game, playerName, card.number);
    }
    //Princess
    if (card.number === 9){
        game.log.push({message: playerName + " played the " + CardInfo.get(card.number)?.name + " and lost the round.", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
        removeCardFromHand(game, playerName, card.number);
        game.log.push({message: playerName + " discarded the " + CardInfo.get(getPlayer(game, playerName)?.hand[0]?? 1)?.name + ".", timestamp: new Date(), sendingPlayer:playerName, receivingPlayers: game.players.map(p => p.name)});
        game.players[getPlayerIndex(game, playerName)].hand = [];
    }
    incrementTurn(game);
    updateGame(game.id,game);
    setCard(undefined);
}

export function PlayCardModal( {card, setCard, changeCard, game} : {card: CardDTO | undefined, setCard:  React.Dispatch<React.SetStateAction<CardDTO | undefined>> ,changeCard: (card: (CardNumber | -1)) => void, game: GameDTO}) {
    const [playerName] = usePlayerName();
    const [selectedOpponent, setSelectedOpponent] = useState<string>("");
    const [selectedCard, setSelectedCard] = useState<(CardNumber | -1)>(-1);
    const [error, setError] = useState<string>("");
    const [selectedCouncilorCards, setSelectedCouncilorCards] = useState<(CardNumber | -1)[]>(game.drawPile.length > 2 ? [-1, -1, -1] : new Array(game.drawPile.length).fill(-1))
    const isNoSelectableOpponent = game.players.filter(player => player.hand.length > 0 && !player.isProtected).length === 1
    const handleClose = () => {
        changeCard(-1);
    }
    console.log(selectedCouncilorCards)
    if (!card){
        return null;
    }
    let possibleCouncilorCards: CardNumber[] = [];
    if (card.number === -6){
        possibleCouncilorCards.push(getOtherCardInHand(game, playerName, -6) as CardNumber);
    }
    for (let i = 0; i < selectedCouncilorCards.length - 1; i++){
        possibleCouncilorCards.push(game.drawPile[game.drawPile.length - i - 1]);
    }

    return (
        <Dialog open={Object.keys(card).length > 0} onClose={handleClose}>
            <DialogTitle>{card.name}</DialogTitle>
            <DialogContent sx={{width: 400, paddingBottom: 4}}>
                <Typography sx={{marginBottom: 2}}>{card.description}</Typography>
                {cardsWithOpponent.includes(card.number) &&
                    <OpponentDropdown game={game} playerName={playerName} selectedOpponent={selectedOpponent} setSelectedOpponent={setSelectedOpponent} showSelf={card.number === 5}/>
                }
                {card.number === 1 && !isNoSelectableOpponent &&
                    <CardDropdown selectedCard={selectedCard} setSelectedCard={setSelectedCard} selectableCards={cardsMinusGuard}/>
                }
                {card.number === -6 &&
                    <div>
                        {selectedCouncilorCards.map((selectedCard, index) => {
                            return <CouncilorCardDropdown selectedCard={selectedCouncilorCards[index]} setSelectedCards={setSelectedCouncilorCards} selectableCards={possibleCouncilorCards} index={index}/>
                        })}
                    </div>
                }
                <Alert severity="error" sx={{display: error === "" ? "none" : "block"}}>{error.trimStart()}</Alert>
                {/*<Typography>{error.trimStart()}</Typography>*/}
            </DialogContent>
            <DialogActions>
                <Button type="submit" disabled={!getIsPlayersTurn(game, playerName) || ([5, 7].includes(card.number) && getPlayer(game, playerName)?.hand.includes(8) ) || (getPlayer(game, playerName)?.hand.includes(-6) && card.number !== -6)} onClick={() => resolveCard(game, setCard, card, selectedCard, selectedOpponent, playerName, setError, selectedCouncilorCards, possibleCouncilorCards)}>{card.number === 6? "Lock in" : "Play"}</Button>
            </DialogActions>
        </Dialog>
    )
}

function OpponentDropdown({game, playerName, selectedOpponent, setSelectedOpponent, showSelf} : {game: GameDTO, playerName: string | null, selectedOpponent: string, setSelectedOpponent: React.Dispatch<React.SetStateAction<string>>, showSelf: boolean}){
    const selectablePlayers = game.players.filter(player => player.hand.length > 0 && !player.isProtected && (showSelf || player.name !== playerName));
    if (selectablePlayers.length === 0){
        return null;
    }
    if (selectablePlayers.length === 1){
        setSelectedOpponent(selectablePlayers[0].name);
    }
    return (
    <FormControl sx={{marginBottom:2}} variant="standard" className="width-100">
        <InputLabel>Player</InputLabel>
        <Select
            variant="standard"
            value={selectedOpponent}
            onChange={(e) => {setSelectedOpponent(e.target.value as string)}}
        >
            {selectablePlayers.map(player => {
                    return <MenuItem value={player.name}>{player.name}</MenuItem>
                }
            )}
        </Select>
    </FormControl>
    )
}

function CardDropdown({selectedCard, setSelectedCard, selectableCards} : {selectedCard: number, setSelectedCard: React.Dispatch<React.SetStateAction<(CardNumber | -1)>>, selectableCards: (CardNumber)[]}){
    return (
        <FormControl sx={{marginBottom:2}} variant="standard" className="width-100">
            <InputLabel>Card</InputLabel>
            <Select
                variant="standard"
                value={selectedCard}
                onChange={(e) => {setSelectedCard(e.target.value as (CardNumber | -1))}}
            >
                {selectableCards.map(card => {
                        return <MenuItem value={card}>{CardInfo.get(card)?.name}</MenuItem>
                    }
                )}
            </Select>
        </FormControl>
    )
}

function CouncilorCardDropdown({selectedCard, setSelectedCards, selectableCards, index} : {selectedCard: CardNumber | -1, setSelectedCards: React.Dispatch<React.SetStateAction<(CardNumber | -1)[]>>, selectableCards: (CardNumber)[], index: number}){
    const titles = ["Card to keep", "Second card from bottom", "Bottom card"];
    return (
        <FormControl sx={{marginBottom:2}} variant="standard" className="width-100">
            <InputLabel>{(selectableCards.length === 2 && index === 1)? titles[2] : titles[index]}</InputLabel>
            <Select
                variant="standard"
                value={selectedCard}
                onChange={(e) => {setSelectedCards((prevState) => {
                    prevState[index] = e.target.value as (CardNumber | -1);
                    return [...prevState];
                })}}
            >
                {selectableCards.map(card => {
                        return <MenuItem value={card}>{CardInfo.get(card)?.name}</MenuItem>
                    }
                )}
            </Select>
        </FormControl>
    )
}

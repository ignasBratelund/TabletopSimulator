import {
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
import {CardDTO, cardInfo, GameDTO} from "../models.types";
import {updateGameAndUpdateLobby} from "../useFirestore";
import {getPlayer, getPlayerIndex} from "./GamePage";

const cardsWithOpponent = [1, 2, 3, 5, 7];
const cardsMinusGuard = [2, 3, 4, 5, 6, 7, 8, 9] as (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];

export function incrementTurn(game: GameDTO){
    if (game.players.filter(player => player.hand.length > 0).length >= 2){
        for (let i = 1; i < game.players.length + 1; i++){
            if (game.players[(game.turn + i) % game.players.length].hand.length > 0){
                game.turn = (game.turn + i) % game.players.length;
                break;
            }
        }
        game.players[game.turn].isProtected = false;
        if(game.drawPile.length >= 1 && game.players[game.turn].hand.length === 1){
            game.players[game.turn].hand.push(game.drawPile.pop()!);
        } else {
            game.turn = -1;
            for (let i = 0; i < game.players.length; i++){
                let leadingPlayersIndex = [-1];
                if (game.players[i].hand.length > 0){
                    game.log.push({action: game.players[i].name + " has a " + game.players[i].hand, timestamp: new Date(), players: game.players.map(p => p.name)});
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
                if (leadingPlayersIndex.length === 1){
                    game.log.push({action: game.players[leadingPlayersIndex[0]].name + " won the round", timestamp: new Date(), players: game.players.map(p => p.name)});
                    game.players[leadingPlayersIndex[0]].score += 1;
                }
                else {
                    game.log.push({action: "The round was a tie between " + leadingPlayersIndex.map(i => game.players[i].name).join(", "), timestamp: new Date(), players: game.players.map(p => p.name)});
                    for (let i = 0; i < leadingPlayersIndex.length; i++){
                        game.players[leadingPlayersIndex[i]].score += 1;
                    }
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
        game.log.push({action: game.players[winningPlayerIndex].name + " won the round", timestamp: new Date(), players: game.players.map(p => p.name)});
        game.players[winningPlayerIndex].score += 1;
    }
}

function removeCardFromHand(game: GameDTO, playerName: string | null, card: number){
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

function resolveCard(game: GameDTO, setCard:  React.Dispatch<React.SetStateAction<CardDTO | undefined>>, card: CardDTO, selectedCard: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | -1), selectedOpponent: string, playerName: string | null, setError: React.Dispatch<React.SetStateAction<string>>){
    setError("")

    // no opponent override
    if (cardsWithOpponent.includes(card.number) && game.players.filter(player => player.hand.length > 0 && !player.isProtected).length === 1){
        removeCardFromHand(game, playerName, card.number);
        game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " to no effect.", timestamp: new Date(), players: game.players.map(p => p.name)});
        incrementTurn(game);
        updateGameAndUpdateLobby(game.id,game);
        setCard(undefined);
        return;
    }

    if (cardsWithOpponent.includes(card.number)){
        if (selectedOpponent === ""){
            setError("Please select an opponent");
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
                    game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and guessed correctly that " + game.players[i].name + " had a " + cardInfo.get(selectedCard)?.name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
                } else {
                    game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and guessed incorrectly that " + game.players[i].name + " had a " + cardInfo.get(selectedCard)?.name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
                }
            }
        }
        removeCardFromHand(game, playerName, card.number);
    }
    //Priest
    //TODO: fix logging
    if (card.number === 2){
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and looked at " + game.players[i].name + "'s hand.", timestamp: new Date(), players: game.players.map(p => p.name)});
                game.log.push({action: game.players[i].name + "'s hand: " + cardInfo.get(game.players[i].hand[0])?.name, timestamp: new Date(), players: [playerName!]});
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
                    game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and won the duel against " + game.players[i].name + ". " + game.players[i].name + " had a " + cardInfo.get(game.players[i].hand[0])?.name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
                    game.players[i].hand = [];

                } else if (game.players[i].hand[0] > getPlayer(game, playerName)?.hand[0]!){
                    game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and lost the duel against " + game.players[i].name + ". " + getPlayer(game, playerName)?.name + " had a " + cardInfo.get(getPlayer(game, playerName)?.hand[0]!)?.name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
                    game.players[getPlayerIndex(game, playerName)].hand = [];
                } else {
                    game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and tied the duel against " + game.players[i].name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
                }
            }
        }
    }
    //Maid
    if (card.number === 4){
        game.players[getPlayerIndex(game, playerName)].isProtected = true;
        game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and protected themselves until their next turn.", timestamp: new Date(), players: game.players.map(p => p.name)});
        removeCardFromHand(game, playerName, card.number);
    }
    //Prince
    if (card.number === 5){
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and forced " + game.players[i].name + " to discard their " + cardInfo.get(game.players[i].hand[0])?.name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
                game.players[i].hand = [];
                if (game.players[i].hand[0] !== 9){
                    game.players[i].hand.push(game.drawPile.pop()!);
                }
            }
        }
        removeCardFromHand(game, playerName, card.number);
    }
    //TODO: handle Councler
    //King
    if (card.number === 7){
        for (let i = 0; i < game.players.length; i++){
            if(game.players[i].name === selectedOpponent){
                game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and swapped hands with " + game.players[i].name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
                removeCardFromHand(game, playerName, card.number);
                const temp = game.players[i].hand;
                game.players[i].hand = game.players[getPlayerIndex(game, playerName)].hand;
                game.players[getPlayerIndex(game, playerName)].hand = temp;
            }
        }
    }
    //Countess
    if ([6, 8].includes(card.number)){
        game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " to no effect.", timestamp: new Date(), players: game.players.map(p => p.name)});
        removeCardFromHand(game, playerName, card.number);
    }
    //Princess
    if (card.number === 9){
        game.log.push({action: playerName + " played the " + cardInfo.get(card.number)?.name + " and lost the round.", timestamp: new Date(), players: game.players.map(p => p.name)});
        removeCardFromHand(game, playerName, card.number);
        game.log.push({action: playerName + " discarded the " + cardInfo.get(getPlayer(game, playerName)?.hand[0]?? 1)?.name + ".", timestamp: new Date(), players: game.players.map(p => p.name)});
        game.players[getPlayerIndex(game, playerName)].hand = [];
    }
    incrementTurn(game);
    updateGameAndUpdateLobby(game.id,game);
    setCard(undefined);
}

export function PlayCardModal( {card, setCard, changeCard, game} : {card: CardDTO | undefined, setCard:  React.Dispatch<React.SetStateAction<CardDTO | undefined>> ,changeCard: (card: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | -1)) => void, game: GameDTO}) {
    const [playerName] = usePlayerName();
    const [selectedOpponent, setSelectedOpponent] = useState<string>("");
    const [selectedCard, setSelectedCard] = useState<(1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | -1)>(-1);
    const [error, setError] = useState<string>("");
    const isNoSelectableOpponent = game.players.filter(player => player.hand.length > 0 && !player.isProtected).length === 1
    const handleClose = () => {
        changeCard(-1);
    }
    if (!card){
        return null;
    }
    return (
        <Dialog sx={{top : "-50%    "}} open={Object.keys(card).length > 0} onClose={handleClose}>
            <DialogTitle>{card.name}</DialogTitle>
            <DialogContent sx={{width: 400, paddingBottom: 4}}>
                <Typography>{card.description}</Typography>
                {cardsWithOpponent.includes(card.number) &&
                    <OpponentDropdown game={game} playerName={playerName} selectedOpponent={selectedOpponent} setSelectedOpponent={setSelectedOpponent} showSelf={card.number === 5}/>
                }
                {card.number === 1 && !isNoSelectableOpponent &&
                    <CardDropdown selectedCard={selectedCard} setSelectedCard={setSelectedCard} selectableCards={cardsMinusGuard}/>
                }
                <Typography>{error.trimStart()}</Typography>
            </DialogContent>
            <DialogActions>
                <Button type="submit" onClick={() => resolveCard(game, setCard, card, selectedCard, selectedOpponent, playerName, setError)}>Play</Button>
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
    <FormControl variant="standard" className="width-100">
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

function CardDropdown({selectedCard, setSelectedCard, selectableCards, altTitle} : {selectedCard: number, setSelectedCard: React.Dispatch<React.SetStateAction<(1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | -1)>>, selectableCards: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[], altTitle?: string}){
    return (
        <FormControl variant="standard" className="width-100">
            <InputLabel>Card</InputLabel>
            <Select
                variant="standard"
                value={selectedCard}
                onChange={(e) => {setSelectedCard(e.target.value as (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | -1))}}
            >
                {selectableCards.map(card => {
                        return <MenuItem value={card}>{cardInfo.get(card)?.name}</MenuItem>
                    }
                )}
            </Select>
        </FormControl>
    )
}

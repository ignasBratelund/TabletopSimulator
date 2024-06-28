import {useNavigate, useParams} from "react-router-dom";
import {Button, Card, Chip,Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {doc, onSnapshot} from "firebase/firestore";
import {db, updateGameAndUpdateLobby} from "../useFirestore";
import {action, CardDTO, cardInfo, GameDTO} from "../models.types";
import {usePlayerName} from "../usePlayerName";
import {PlayCardModal} from "./PlayCardModal";

export const freshDrawPile = [1,1,1,1,1,1,2,2,3,3,4,4,5,5,6,6,7,8,9] as  (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];

export function getPlayer(game: GameDTO, playerName: string | null) {
    if (!playerName){
        return null
    }
    return game.players.find(player => player.name === playerName);
}

export function getPlayerIndex(game: GameDTO, playerName: string | null) {
    if (!playerName){
        return -1
    }
    return game.players.findIndex(player => player.name === playerName);
}

function getIsAdmin(game: GameDTO, playerName: string | null) {
    if (!playerName){
        return false
    }
    return game.admin === playerName;
}

export function getIsPlayersTurn(game: GameDTO, playerName: string | null) {
    if (!playerName || game.turn === -1){
        return false
    }
    return game.players[game.turn].name === playerName;
}
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function resetGame(game: GameDTO) {
    game.turn = 0;
    game.players = shuffleArray(game.players);
    game.drawPile = shuffleArray(freshDrawPile);
    for (let i = 0; i < game.players.length; i++) {
        game.players[i].isProtected = false;
        const topCard = game.drawPile.pop();
        if (topCard !== undefined){
            game.players[i].hand = [topCard];
            if(i===0){
                const secondCard = game.drawPile.pop();
                if (secondCard !== undefined ){
                    game.players[i].hand.push(secondCard)
                }
            }
        } else{
            console.log("No more cards in draw pile") // This should never happen
        }
    }
    game.log.push({action: "A new round has started", timestamp: new Date()});
    updateGameAndUpdateLobby(game.id, game);
}

export function GamePage() {
    const [game, setGame] = useState<GameDTO>();
    const [error, setError] = useState<boolean>(false);
    const [gameLog, setGameLog] = useState<action[]>([]);
    const [playedCard, setPlayedCard] = useState<CardDTO | undefined>(undefined);
    const id = useParams().id;
    const [playerName ] = usePlayerName();
    const textFieldRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if(textFieldRef.current !== null) {
            textFieldRef.current.scrollTop = textFieldRef.current.scrollHeight;
        }
    }, [gameLog])

    useEffect(() => {
        if (id === undefined) return;
        const unsub = onSnapshot(doc(db, "game", id.toString()), (data) => {
            if(!data.exists()){
                setError(true)
                return;
            }
            const gameDTO = data.data() as GameDTO;
            gameDTO.id = data.id;
            setGame(gameDTO);
            let logsToAdd: action[] = [];
            gameDTO.log.forEach((action) => {
                if (!gameLog.includes(action)){
                    logsToAdd.push(action);
                }
            });
            setGameLog(gameLog.concat(logsToAdd));
            console.log("Fetching game")
        });
        return () => unsub();
    }, [])

    if(game !== undefined && playerName !== null && !game.players.map(p => p.name).includes(playerName)){
        game.log.push({action: playerName + " joined the game", timestamp: new Date()});
        game.players.push({name: playerName, score: 0, hand: [], isProtected: false});
        updateGameAndUpdateLobby(game.id, game)
    }

    if (error){
        return (
            <div className={"flex"}>

                <Typography variant={"h2"} sx={{textAlign: "center"}}> Game not found </Typography>
                <BackButton/>
            </div>
        )
    }

    if(game === undefined){
        return <div></div>
    }

    function changePlayedCard(card: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | -1)) {
        if (card === -1){
            setPlayedCard(undefined);
        } else {
            setPlayedCard(cardInfo.get(card));
        }
    }

    return (
        <div className="height-100vh flex-column align-center">
            {playedCard && <PlayCardModal card={playedCard} setCard={setPlayedCard} changeCard={changePlayedCard} game={game} setGameLog={setGameLog}/>}
            <div>
                <Typography variant={"h2"} sx={{textAlign: "center", marginBottom: "64px"}}> {game?.name} </Typography>
                <BackButton/>
            </div>
            <Card className="game-height" sx={{width: "80%", justifySelf:"center"}}>
                <div className="m-16 flex height-100-minus-32px">

                    <div className="flex-column flex-grow1">
                        <Typography variant={"h6"} sx={{textAlign: "center"}}>Players</Typography>
                        {game.players.map((player) => {
                            return <Chip key={player.name} label={player.name + (player.isProtected ? "🛡️" : "")} variant="outlined" sx={player.hand.length === 0 ? {"& .MuiChip-label": {textDecoration: "line-through"}}: {}}/>
                        })}
                    </div>
                    <div className="flex-column flex-grow2 align-center">
                        {game.turn !== -1 ?
                            <Typography variant={"h6"} sx={{textAlign: "center"}}>{game.players[game.turn]?.name + "'s turn"}</Typography>
                            : getIsAdmin(game, playerName) && game.players.length > 1 &&
                            <Button sx={{width: "170px", alignSelf: "center"}} onClick={() => resetGame(game)}>Start new Round</Button>
                        }
                        <div className="flex margin-top-auto">
                            {getPlayer(game, playerName)?.hand.map((card) => {
                                return (
                                    <div className="flex-column margin-top-auto">
                                        <Button sx={{width: "60px", alignSelf:"center"}} disabled={!getIsPlayersTurn(game, playerName)} onClick={() => setPlayedCard(cardInfo.get(card))}>Play</Button>
                                        <Card sx={{height: "380px", width: "240px"}}>{
                                            <div>

                                            <Typography variant="h5" sx={{textAlign: "center"}}>{cardInfo.get(card)?.name}</Typography>
                                            <Typography sx={{textAlign: "center", marginTop: 2}}>{cardInfo.get(card)?.description}</Typography>
                                            </div>
                                        }</Card>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex-column flex-grow1">
                        <Typography
                            ref={textFieldRef}
                            border={2}
                            display="block"
                            variant={"body1"}
                            sx={{
                                whiteSpace: "pre-wrap",
                                height: "100%",
                                overflowY: "scroll",
                                padding: 1,
                                borderRadius: 2,
                                borderColor: "rgba(0, 0, 0, 0.23)",
                                color: "rgba(0, 0, 0, 0.70)",
                                lineHeight: "1.5",
                            }
                        }>
                            {gameLog.map((action) => action.action).join("\n")}
                        </Typography>
                    </div>
                </div>
            </Card>
        </div>
    );
}
function BackButton() {
    const navigate = useNavigate();
    return (
        <Button size="large" sx={{display: "block", fontSize: "20px", position: "absolute", right: "16px", top: "8px"}} onClick={() => navigate("/")}>Return to lobby</Button>
    );
}

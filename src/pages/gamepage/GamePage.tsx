import {useNavigate, useParams} from "react-router-dom";
import {Button, Card, Chip, TextField, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {doc, onSnapshot} from "firebase/firestore";
import {db, updateGameAndUpdateLobby} from "../useFirestore";
import {action, GameDTO} from "../models.types";
import {usePlayerName} from "../usePlayerName";

function getSelfPlayer(game: GameDTO, playerName: string | null) {
    if (!playerName){
        return null
    }
    return game.players.find(player => player.name === playerName);
}

function getIsAdmin(game: GameDTO, playerName: string | null) {
    if (!playerName){
        return false
    }
    return game.admin === playerName;
}

function getIsPlayersTurn(game: GameDTO, playerName: string | null) {
    if (!playerName || game.turn === -1){
        return false
    }
    return game.players[game.turn].name === playerName;
}
export function GamePage() {
    const [game, setGame] = useState<GameDTO>();
    const [error, setError] = useState<boolean>(false);
    const [gameLog, setGameLog] = useState<action[]>([]);
    const id = useParams().id;
    const [playerName ] = usePlayerName();
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
            setGameLog(gameDTO.log);
            console.log("Fetching game")
        });
        return () => unsub();
    }, [])

    if(game !== undefined && playerName !== null && !game.players.map(p => p.name).includes(playerName)){
        game.log.push({action: playerName + " joined the game", timestamp: new Date()});
        game.players.push({name: playerName, score: 0, hand: []});
        updateGameAndUpdateLobby(game.id, game).then(() => {
    })}
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

    return (
        <div className="height-100vh flex-column align-center">
            <div>
                <Typography variant={"h2"} sx={{textAlign: "center", marginBottom: "64px"}}> {game?.name} </Typography>
                <BackButton/>
            </div>
            <Card className="game-height" sx={{width: "80%", justifySelf:"center"}}>
                <div className="margin-16 flex height-100-minus-32px">

                    <div className="flex-column flex-grow1">
                        <Typography variant={"h6"} sx={{textAlign: "center"}}>Players</Typography>
                        {game.players.map((player) => {
                            return <Chip key={player.name} label={player.name} variant="outlined"/>
                        })}
                    </div>
                    <div className="flex-column flex-grow2">
                        {game.turn !== -1 ?
                            <Typography variant={"h6"} sx={{textAlign: "center"}}>{game.players[game.turn]?.name + "'s turn"}</Typography>
                            : getIsAdmin(game, playerName) &&
                            <Button sx={{width: "170px", alignSelf: "center"}}>Start new Round</Button>
                        }
                        {getSelfPlayer(game, playerName)?.hand.map((card) => {
                            return (
                                <div className="card-group">
                                    <Button sx={{width: "60px", alignSelf:"center"}} disabled={!getIsPlayersTurn(game, playerName)}>Play</Button>
                                    <Card sx={{height: "380px"}}>{
                                        <Typography sx={{textAlign: "center"}}>{card}</Typography>
                                    }</Card>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex-column flex-grow1">
                        <TextField
                            id="outlined-multiline-static"
                            label="Game log"
                            multiline
                            rows={6}
                            disabled
                            value={gameLog.map((action) => action.action).join("\n")}
                            sx={{
                                "& .MuiInputBase-input.Mui-disabled": {
                                    WebkitTextFillColor: "#00000085",
                                },
                                "& .MuiInputLabel-root": {
                                    WebkitTextFillColor: "#00000085",
                                },
                                marginTop: "auto",
                            }}
                        />
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

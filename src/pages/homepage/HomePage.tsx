import {doc, DocumentData, onSnapshot} from "firebase/firestore";
import {db, getCollection} from "../useFirestore";
import React, {useEffect, useState} from "react";
import {usePlayerName} from "../usePlayerName";
import {PlayerNameModal} from "../PlayerNameModal";
import LobbyCard from "./LobbyCard";
import {Button, Container, Typography} from "@mui/material";
import {NewGameModal} from "./NewGameModal";
import {GameDTO} from "../models.types";

const getGames = async (data: DocumentData, setData:  React.Dispatch<React.SetStateAction<DocumentData[]>>) => {
    await getCollection('game').then(response => {
        if (response !== data){
            setData(response);
        }
    });
}

export function HomePage() {
    const [data, setData] = useState<DocumentData[]>([]);
    const [playerName, ] = usePlayerName();
    const [playerNameModalOpen, setPlayerNameModalOpen] = useState<boolean>(playerName == null);
    const [newGameModalOpen, setNewGameModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "lobbyController", "1"), () => {
            getGames(data, setData);
            console.log("Fetching lobby")
        });
        return () => unsub();
    }, [getGames])
    const lobby = data.map((item) => {
        const gameDTO = item.data as GameDTO;
        gameDTO.id = item.id;
        return gameDTO})
    return (
        <div>
            <NewGameModal NewGameModalOpen={newGameModalOpen} setNewGameModalOpen={setNewGameModalOpen}/>
            <PlayerNameModal playerNameModalOpen={playerNameModalOpen} setPlayerNameModalOpen={setPlayerNameModalOpen}/>
            <Typography variant={"h2"} sx={{textAlign: "center", marginBottom: "32px"}}>Join a game or <Button className={"button-as-h3"} variant={"text"} onClick={() => setNewGameModalOpen(true)}>Create your own</Button> </Typography>
            <Container className={"card-container"} maxWidth="xl" >
                {lobby.map((game) => {
                    return <LobbyCard key={game.id} game={game}/>
                })}
            </Container>
        </div>
    );
}
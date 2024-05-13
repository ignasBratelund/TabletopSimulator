import {doc, DocumentData, onSnapshot} from "firebase/firestore";
import {db, getTable} from "../useFirestore";
import React, {useEffect, useState} from "react";
import {usePlayerName} from "../usePlayerName";
import {PlayerNameModal} from "../PlayerNameModal";
import LobbyCard from "./LobbyCard";
import {Button, Container, Typography} from "@mui/material";
import {NewGameModal} from "./NewGameModal";
import {GameDTO} from "../models.types";

export function HomePage() {
    const [data, setData] = useState<DocumentData[]>([]);
    const [playerName, ] = usePlayerName();
    const [playerNameModalOpen, setPlayerNameModalOpen] = useState<boolean>(playerName == null);
    const [newGameModalOpen, setNewGameModalOpen] = useState<boolean>(false);
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "lobbyController", "1"), () => {
            getTest();
            console.log("triggered")
        });
    }, [])
    const getTest = async () => {
        await getTable('game').then(respone => {
            if (respone !== data){
                setData(respone);
            }
            console.log(respone)
        });
    }
    const lobby = data.map((item) => {return item.data as GameDTO})
    return (
        <div className={"backgroud-grey"}>
            <NewGameModal NewGameModalOpen={newGameModalOpen} setNewGameModalOpen={setNewGameModalOpen}/>
            <PlayerNameModal playerNameModalOpen={playerNameModalOpen} setPlayerNameModalOpen={setPlayerNameModalOpen}/>
            <Typography variant={"h2"} sx={{textAlign: "center", marginBottom: "32px"}}>Join a game or <Button className={"button-as-h3"} variant={"text"} onClick={() => setNewGameModalOpen(true)}>Create your own</Button> </Typography>
            {/*<button onClick={() => getTest()}>Click me</button>*/}
            {/*<Button variant={"outlined"} onClick={() => {*/}
            {/*    writeToTable("test", {field1: "dsaas", field2:345})*/}
            {/*    updateTable("lobbyController", "1", {i: Math.random().toString(36).substring(3)})*/}
            {/*}}>Click me</Button>*/}
            <Container className={"card-container"} maxWidth="xl" >
                {lobby.map((item) => {
                    return <LobbyCard game={item}/>
                })}
            </Container>
            {/*<ul>*/}
            {/*    {data.map((item) => {*/}
            {/*        return <li key={item.id}>{item.data.field1}</li>*/}
            {/*    })}*/}
            {/*</ul>*/}
        </div>
    );
}
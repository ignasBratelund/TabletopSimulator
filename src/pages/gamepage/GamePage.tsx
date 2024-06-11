import {useNavigate, useParams} from "react-router-dom";
import {Button, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {doc, onSnapshot} from "firebase/firestore";
import {db} from "../useFirestore";
import {GameDTO} from "../models.types";

export function GamePage() {
    const [game, setGame] = useState<GameDTO>();
    const [error, setError] = useState<boolean>(false);
    const id = useParams().id;
    const navigate = useNavigate();
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
            console.log("Fetching game")
        });
        return () => unsub();
    }, [])
    if (error){
        return (
            <div >

                <Typography variant={"h2"} sx={{textAlign: "center"}}> Game not found </Typography>
                <Button size="large" sx={{display: "block", margin: "auto", fontSize: "30px"}} onClick={() => navigate("/")}>Return to lobby</Button>
            </div>
        )
    }
    if(game === undefined){
        return <div></div>
    }
    return (
        <div>
            <Typography variant={"h2"} sx={{textAlign: "center", marginBottom: "32px"}}> {game?.name} </Typography>
        </div>
    );
}
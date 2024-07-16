import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import React, {useState} from "react";
import {usePlayerName} from "./usePlayerName";

export function PlayerNameModal( {playerNameModalOpen, setPlayerNameModalOpen} : {playerNameModalOpen : boolean, setPlayerNameModalOpen : React.Dispatch<React.SetStateAction<boolean>>}) {
    const [playerNameField, setPlayerNameField] = useState<string>("");
    const [, setPlayerName] = usePlayerName();
    const onSubmitPlayerName = () => {
        if(playerNameField !== ""){
            localStorage.setItem("playerName", playerNameField)
            setPlayerNameModalOpen(false);
        }
    }
    return (
        <Dialog sx={{top : "-50%"}} open={playerNameModalOpen}>
            <DialogTitle>Enter your username</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    name="email"
                    label="Username"
                    type="email"
                    fullWidth
                    variant="standard"
                    onChange={(e) => {setPlayerNameField(e.target.value)}}
                />
            </DialogContent>
            <DialogActions>
                <Button type="submit" onClick={onSubmitPlayerName}>Send</Button>
            </DialogActions>
        </Dialog>
    )
}
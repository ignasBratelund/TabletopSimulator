import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import React, {useState} from "react";

export function PlayerNameModal() {
    const [playerNameField, setPlayerNameField] = useState<string>("");
    const onSubmitPlayerName = () => {
        if(playerNameField !== ""){
            localStorage.setItem("playerName", playerNameField)
            window.location.reload()
        }
    }

    return (
        <Dialog sx={{top : "-50%"}} open={true}>
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
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import React, {useState} from "react";
import {usePlayerName} from "../usePlayerName";
import {writeToGameAndUpdateLobby} from "../useFirestore";
import {useNavigate} from "react-router-dom";
import {shuffleArray} from "../Util/arrayUtil";
const freshDrawPile = [1,1,1,1,1,1,2,2,3,3,4,4,5,5,6,6,7,8,9];

export function NewGameModal( {NewGameModalOpen, setNewGameModalOpen} : {NewGameModalOpen : boolean, setNewGameModalOpen : React.Dispatch<React.SetStateAction<boolean>>}) {
    const [playerName] = usePlayerName();
    const [newGameNameField, setNewGameNameField] = useState<string>(playerName + "'s game");
    const [error, setError] = useState<boolean>(false);
    const shuffledDrawPile = shuffleArray(freshDrawPile);
    const navigate = useNavigate();
    const onSubmitNewGame = () => {
        if(newGameNameField !== ""){
            setNewGameModalOpen(false);
            writeToGameAndUpdateLobby({name: newGameNameField, turn: 1, players: [playerName], drawPile: shuffledDrawPile, createTime: new Date()}).then((response) => {navigate("/" + response)});
        }else {
            setError(true);
        }
    }

    const handleClose = () => {
        setNewGameModalOpen(false);
    }
    return (
        <Dialog sx={{top : "-50%"}} open={NewGameModalOpen} onClose={handleClose}>
            <DialogTitle>Create New Lobby</DialogTitle>
            <DialogContent sx={{width: 250}}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    name="email"
                    label="Lobby Name"
                    type="email"
                    fullWidth
                    variant="standard"
                    defaultValue={playerName + "'s game"}
                    onChange={(e) => {setNewGameNameField(e.target.value)}}
                    error={error}
                    helperText={error ? "Please enter a name" : ""}
                />
            </DialogContent>
            <DialogActions>
                <Button type="submit" onClick={onSubmitNewGame}>Send</Button>
            </DialogActions>
        </Dialog>
    )
}
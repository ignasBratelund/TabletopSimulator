import {Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography} from "@mui/material";
import {GameDTO} from "../models.types";
import {useNavigate} from "react-router-dom";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {deleteGameAndUpdateLobby} from "../useFirestore";

interface LobbyCardProps {
    game: GameDTO;
}
export default function LobbyCard({ game }: LobbyCardProps) {
    const navigate = useNavigate();
    return (
        <Card sx={{ width: 275 }}>
            <CardHeader title={<Typography noWrap variant="h5" >{game.name}</Typography>} sx={{
                display: "flex",
                overflow: "hidden",
                "& .MuiCardHeader-content": {
                    overflow: "hidden"
                }

            }}
            action={
                <IconButton aria-label="settings" onClick={() => deleteGameAndUpdateLobby( game.id)}>
                    <DeleteOutlinedIcon color={"primary"} />
                </IconButton>
            }>
            </CardHeader>
            <CardContent>
                <Typography variant="body2">
                    Players: {game.players.length}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={() => navigate("/game/" + game.id)}>Join Game</Button>
            </CardActions>
        </Card>
    );
}
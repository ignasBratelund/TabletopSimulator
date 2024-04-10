import {useState} from "react";

export function usePlayerName(): [string | null, (newName: string) => void] {
    const defaultPlayerName= localStorage.getItem("tabletop-playerName");
    const [playerName, setPlayerName] = useState<string | null>(defaultPlayerName);
    function setPlayerNameAndStore(newName: string) {
        setPlayerName(newName);
        localStorage.setItem("tabletop-playerName", newName);
    }
    return [ playerName, setPlayerNameAndStore ];
}
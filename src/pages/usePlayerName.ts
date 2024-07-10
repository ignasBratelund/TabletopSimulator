import {useEffect, useState} from "react";

export function usePlayerName() {
    const [playerName, setPlayerName] = useState<string | null>(localStorage.getItem("tabletop-playerName"));

    useEffect(() => {
        const handleStorageChange = () => {
            setPlayerName(localStorage.getItem("tabletop-playerName"));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return [playerName, setPlayerName] as const;
}
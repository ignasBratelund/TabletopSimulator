import {useEffect, useState} from "react";

export function usePlayerName() {
    const [playerName, setPlayerName] = useState<string | null>(localStorage.getItem("playerName"));

    useEffect(() => {
        const handleStorageChange = () => {
            setPlayerName(localStorage.getItem("playerName"));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return [playerName, setPlayerName] as const;
}
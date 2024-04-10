import {doc, DocumentData, onSnapshot} from "firebase/firestore";
import {db, getTable, updateTable, writeToTable} from "../useFirestore";
import React, {useEffect, useState} from "react";
import {usePlayerName} from "../usePlayerName";
import {PlayerNameModal} from "../PlayerNameModal";

export function HomePage() {
    const [data, setData] = useState<DocumentData[]>([]);
    const [playerName, ] = usePlayerName();
    const [playerNameModalOpen, setPlayerNameModalOpen] = useState<boolean>(playerName == null);
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "lobbyController", "1"), () => {
            getTest();
            console.log("triggered")
        });
    }, [])
    const getTest = async () => {
        await getTable('test').then(respone => {
            if (respone !== data){
                setData(respone);
            }
            console.log(respone)
        });
    }
    return (
        <div>
            <PlayerNameModal playerNameModalOpen={playerNameModalOpen} setPlayerNameModalOpen={setPlayerNameModalOpen}/>
            <h1>Home Page</h1>
            {/*<button onClick={() => getTest()}>Click me</button>*/}
            <button onClick={() => {
                writeToTable("test", {field1: "dsaas", field2:345})
                updateTable("lobbyController", "1", {i: Math.random().toString(36).substring(3)})
            }}>Click me</button>
            <ul>
                {data.map((item) => {
                    return <li key={item.id}>{item.data.field1}</li>
                })}
            </ul>
        </div>
    );
}
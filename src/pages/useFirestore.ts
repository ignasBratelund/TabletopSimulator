import {collection, getDocs, getFirestore, doc, setDoc, addDoc, deleteDoc} from "firebase/firestore";
import {initializeApp} from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyB8q2zf_hteKj4ZSy1ZcgHRgVjT_eDKP-I",
    authDomain: "react-653c7.firebaseapp.com",
    databaseURL: "https://react-653c7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "react-653c7",
    storageBucket: "react-653c7.appspot.com",
    messagingSenderId: "768930393046",
    appId: "1:768930393046:web:b6d93dee3c7aa0a35c1277"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const docRef = doc(db, 'collection/doc');
export const getTable = async (tableName: string) => {
    const tableCol = collection(db, tableName);
    const tableSnapshot = await getDocs(tableCol);
    const objectList = tableSnapshot.docs.map(doc => ({id: doc.id, data:doc.data()}));
    return objectList;
}

export const writeToTable = async (tableName: string, object: any): Promise<string> => {
    const tableCol = collection(db, tableName);
    return await addDoc(tableCol, object).then(result => {
        return result.id;
    });
}

export const updateTable = async (tableName: string, id: string, object: any) => {
    await setDoc(doc(db, tableName, id), object)
}

export const deleteDocument = async (tableName: string, id: string) => {
    await deleteDoc(doc(db, tableName, id))
}

export const writeToGameAndUpdateLobby = async (object: any) => {
    writeToTable("game", object).then(id => {
        updateTable("lobbyController", "1", {i: Math.random().toString(36).substring(3)})
        return id;
    })
}

export const deleteGameAndUpdateLobby = async (id: string) => {
    deleteDocument("game", id).then(() => {
        updateTable("lobbyController", "1", {i: Math.random().toString(36).substring(3)})
    })
}
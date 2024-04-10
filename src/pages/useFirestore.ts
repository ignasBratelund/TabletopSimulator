import {collection, getDocs, getFirestore, doc, setDoc, addDoc} from "firebase/firestore";
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

export const writeToTable = async (tableName: string, object: any) => {
    const tableCol = collection(db, tableName);
    await addDoc(tableCol, object).then(result => {
        console.log(result);
    });
}

export const updateTable = async (tableName: string, id: string, object: any) => {
    await setDoc(doc(db, tableName, id), object).then(result => {
        console.log(result);
    });
}
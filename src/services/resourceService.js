// https://medium.com/@unosega/to-do-list-web-app-vite-react-and-firebase-3c1798eb28c5
// https://firebase.google.com/docs/web/setup

import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export const addResourceToFirestore = async (resource) => {
    try {
        const docRef = await addDoc(collection(db, "resources"), resource);
        return {id: docRef.id, ...resource}
    } catch (error) {
        console.error("Error adding resource: ", error)
    }
}





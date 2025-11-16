// https://medium.com/@unosega/to-do-list-web-app-vite-react-and-firebase-3c1798eb28c5
// https://firebase.google.com/docs/web/setup

import { collection, doc, getDoc, setDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";

// Resources
export const addResourceToFirestore = async (resource) => {
    try {
        const docRef = await addDoc(collection(db, "resources"), resource);
        return {id: docRef.id, ...resource}
    } catch (error) {
        console.error("Error adding resource: ", error)
    }
}

export const fetchResources = async (setResources, setResourceLoading) => {
    const docSnap = await getDoc(doc(db, "resources", "current"));
    const resources = docSnap.data().resources

    console.log(resources)

    setResources(resources)
    setResourceLoading(false)
}

// Fundings
export const fetchFunding = async (setFunding, setFundingLoading) => {
    const docSnap = await getDoc(doc(db, "funding", "current"));

    if (!docSnap.empty) {
        const funding = docSnap.data(); // Get first document
        setFunding(funding);
    } else {
        console.log("No funding documents found");
    }
    
    setFundingLoading(false);
}

// Events
// export const fetchEvents = async (setEvents, setEventsLoading) => {

// }




// User Preferences Functions
export const getUserPreferences = async (userId) => {
    try {
        const prefsRef = doc(db, 'userPreferences', userId);
        const prefsSnap = await getDoc(prefsRef);
        
        if (prefsSnap.exists()) {
            return prefsSnap.data();
        } else {
            // Return default preferences if none exist
            return {
                theme: 'dark',
                pushNotifications: true,
                emailNotifications: true
            };
        }
    } catch (error) {
        console.error("Error getting user preferences: ", error);
        return {
            theme: 'dark',
            pushNotifications: true,
            emailNotifications: true
        };
    }
}

export const updateUserPreferences = async (userId, preferences) => {
    try {
        const prefsRef = doc(db, 'userPreferences', userId);
        const prefsSnap = await getDoc(prefsRef);
        
        if (prefsSnap.exists()) {
            // Update existing preferences
            await updateDoc(prefsRef, {
                ...preferences,
                lastUpdated: new Date().toISOString()
            });
        } else {
            // Create new preferences document
            await setDoc(prefsRef, {
                userId,
                ...preferences,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error updating user preferences: ", error);
        throw error;
    }
}

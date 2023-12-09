import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth  , signInWithEmailAndPassword} from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import {initializeFirestore} from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyD17LD2iXzmN-ERFl9hl21Ve5S3dNUElS8",
  authDomain: "whatsapp-f3fed.firebaseapp.com",
  projectId: "whatsapp-f3fed",
  storageBucket: "whatsapp-f3fed.appspot.com",
  messagingSenderId: "176282289137",
  appId: "1:176282289137:web:df559bbe82fa413422ba50"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
export function signIn(email, password){
    return signInWithEmailAndPassword(auth, email , password)
}
export function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
}
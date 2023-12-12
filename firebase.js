import { initializeApp } from "firebase/app";
import { ToastAndroid } from "react-native";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyD17LD2iXzmN-ERFl9hl21Ve5S3dNUElS8",
  authDomain: "whatsapp-f3fed.firebaseapp.com",
  projectId: "whatsapp-f3fed",
  storageBucket: "whatsapp-f3fed.appspot.com",
  messagingSenderId: "176282289137",
  appId: "1:176282289137:web:df559bbe82fa413422ba50",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCredential;
  } catch (error) {
    ToastAndroid.show(
      error.message.toString(),
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );

    console.error("Sign-in error:", error.message);
  }
}
export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCredential;
  } catch (error) {
    ToastAndroid.show(
      error.message.toString(),
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    throw error;
  }
}

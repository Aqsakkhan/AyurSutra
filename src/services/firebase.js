// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFFmNr03R_c15L44_QHLc0YubiIZRqspE",
  authDomain: "ayursutra-2c9f0.firebaseapp.com",
  projectId: "ayursutra-2c9f0",
  storageBucket: "ayursutra-2c9f0.firebasestorage.app",
  messagingSenderId: "753520829049",
  appId: "1:753520829049:web:108cb1d5c3a807a293aaa8",
  measurementId: "G-C6XM4KSFMX",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

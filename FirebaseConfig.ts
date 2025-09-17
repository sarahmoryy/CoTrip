// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUrI1A298t8obPNEped4nJz-gFS3d9qIA",
  authDomain: "cotrip-97369.firebaseapp.com",
  projectId: "cotrip-97369",
  storageBucket: "cotrip-97369.firebasestorage.app",
  messagingSenderId: "848904963938",
  appId: "1:848904963938:web:861f5fe9e1810607c04e3b",
  measurementId: "G-HC4HW6LTBF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app,{
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
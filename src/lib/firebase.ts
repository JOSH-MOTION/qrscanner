// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "qr-linkit",
  "appId": "1:190835719516:web:3ed0399f541da98a401599",
  "storageBucket": "qr-linkit.firebasestorage.app",
  "apiKey": "AIzaSyDP04LCuYEvgc8trtJ0sZY7zeZXRsm4MKc",
  "authDomain": "qr-linkit.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "190835719516"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

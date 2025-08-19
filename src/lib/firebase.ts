// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWip0hlX4-ub4IPfj7HYXwERtKPqrg20A",
  authDomain: "qrcode-26e2e.firebaseapp.com",
  projectId: "qrcode-26e2e",
  storageBucket: "qrcode-26e2e.firebasestorage.app",
  messagingSenderId: "420385852999",
  appId: "1:420385852999:web:c6664f171aa20b079a2b62",
  measurementId: "G-8LYKMLH8KL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

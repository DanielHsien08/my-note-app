// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "ntu-genai-noteapp-daniel.firebaseapp.com",
    projectId: "ntu-genai-noteapp-daniel",
    storageBucket: "ntu-genai-noteapp-daniel.firebasestorage.app",
    messagingSenderId: "205754409350",
    appId: "1:205754409350:web:aa611cc67f070a14f64c07" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);
// Initialize Firebase Authentication
const auth = getAuth(app);

export { db, auth };
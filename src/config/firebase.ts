// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQkAnYPhZ_lLhVpMjy4lkzDPJkub8nJj0",
  authDomain: "plstm-3a5a1.firebaseapp.com",
  projectId: "plstm-3a5a1",
  storageBucket: "plstm-3a5a1.firebasestorage.app",
  messagingSenderId: "390872580173",
  appId: "1:390872580173:web:4eaae96597981432ee5c04",
  measurementId: "G-GN0CWBJFE8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
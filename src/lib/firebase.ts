import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAi6wHli9iFP3f1rd5emokJnc1AiN6OUzM",
  authDomain: "medikloud20.firebaseapp.com",
  projectId: "medikloud20",
  storageBucket: "medikloud20.firebasestorage.app",
  messagingSenderId: "526006850659",
  appId: "1:526006850659:web:6679c32319b72700349456",
  measurementId: "G-M5TJCXTMF4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage }; 
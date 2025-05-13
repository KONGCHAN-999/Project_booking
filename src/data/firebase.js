import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4g2bPQ1Kr2Z9ldy9JN2F2ZtDGDZ1B6es",
  authDomain: "myfhosting-91366.firebaseapp.com",
  projectId: "myfhosting-91366",
  storageBucket: "myfhosting-91366.firebasestorage.app",
  messagingSenderId: "568304818530",
  appId: "1:568304818530:web:8fbe1988f3e749410cb43b",
  measurementId: "G-M5K6FFLHNH"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmLoWcAl0pS3jYar2rZxSdrjKPIZNemNQ",
  authDomain: "mirsad-abe91.firebaseapp.com",
  projectId: "mirsad-abe91",
  storageBucket: "mirsad-abe91.firebasestorage.app",
  messagingSenderId: "725337354740",
  appId: "1:725337354740:web:aee7c1c2a9ac455e3f49a1",
  measurementId: "G-VCNEF8F9T2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

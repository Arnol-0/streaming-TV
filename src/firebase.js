import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyBbiKnnMsN0_f5Czv8cNffkNp90Xd1cvSY",
  authDomain: "streamingtv-66b2e.firebaseapp.com",
  databaseURL: "https://streamingtv-66b2e-default-rtdb.firebaseio.com",
  projectId: "streamingtv-66b2e",
  storageBucket: "streamingtv-66b2e.firebasestorage.app",
  messagingSenderId: "406078453717",
  appId: "1:406078453717:web:6621a5dc2523a72cbaef5c",
  measurementId: "G-RVVXKCPQGJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

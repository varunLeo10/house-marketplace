import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwUWv88o_cyW1sQXEVkY5TOZx210gJDa8",
  authDomain: "house-marketplace-app-a6c9e.firebaseapp.com",
  projectId: "house-marketplace-app-a6c9e",
  storageBucket: "house-marketplace-app-a6c9e.appspot.com",
  messagingSenderId: "335690201518",
  appId: "1:335690201518:web:40ae29d81cf100ff51303f",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3LOYBqgtX6LeX8O8EoTkw6JJHXA6LZEs",
  authDomain: "tradex-offical.firebaseapp.com",
  projectId: "tradex-offical",
  storageBucket: "tradex-offical.firebasestorage.app",
  messagingSenderId: "240836599454",
  appId: "1:240836599454:web:935f73d39d47f19899e58f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;

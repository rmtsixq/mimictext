import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeidHcWq9zGqeyNgUZRXZJA3D_3G_5y58",
  authDomain: "mimictext.firebaseapp.com",
  projectId: "mimictext",
  storageBucket: "mimictext.firebasestorage.app",
  messagingSenderId: "161960200749",
  appId: "1:161960200749:web:0f6090344923f8f51d46a4",
  measurementId: "G-7YDPZ423Z7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 
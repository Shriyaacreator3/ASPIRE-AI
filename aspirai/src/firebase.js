import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQTZbwcmV0Q5RZrbet5_Kb0Mj9B4ykIXM",
  authDomain: "aspirai-3c9bf.firebaseapp.com",
  projectId: "aspirai-3c9bf",
  storageBucket: "aspirai-3c9bf.firebasestorage.app",
  messagingSenderId: "1029208870388",
  appId: "1:1029208870388:web:c2a87bf74f635815e9fda1",
  measurementId: "G-LR2HGPS05Y"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth= getAuth(app);
export const database=getFirestore(app);
export const googleProvider=new GoogleAuthProvider();

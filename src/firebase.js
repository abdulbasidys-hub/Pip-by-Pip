// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7HUsKHjtv7OCMSajJfAVqGLfoGEHHPtg",
  authDomain: "pip-by-pip-d14d6.firebaseapp.com",
  projectId: "pip-by-pip-d14d6",
  storageBucket: "pip-by-pip-d14d6.firebasestorage.app",
  messagingSenderId: "142876638905",
  appId: "1:142876638905:web:bc883d7846381ed8cb6568"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
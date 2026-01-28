//IMPORT FUNCTIONS TO INITIALISE FIREBASE APP 
import { initializeApp, getApps } from "firebase/app";
//IMPORT FIREBASE AUTHENTICATION FUNTIONS
import { getAuth } from "firebase/auth";
//IMPORT FIRESTORE DATABASE FUNCTIONS
import { getFirestore } from 'firebase/firestore';

//FIREBASE PROJECT CONFIGURATION (FROM FIRESTORE)
const firebaseConfig = {
  apiKey: "AIzaSyD4uEC8h6CY5fqx61X5qAdm2nbAw2bhs3U",
  authDomain: "richfieldqueue.firebaseapp.com",
  projectId: "richfieldqueue",
  storageBucket: "richfieldqueue.appspot.com",
  messagingSenderId: "61373338949",
  appId: "1:61373338949:web:711ae6cdb2e5b0253bda2c",
  measurementId: "G-2X3BQZ871T"
};

//INITIALISE FIREBASE APP
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

//SETTING FIREBASE SERVICE FOR SIGNINS AND SIGNOUTS
const auth = getAuth(app);

//SETTING FIRESTORE DATABASE SERVICES FOR DATA STORAGE/RETRIVAL
const db = getFirestore(app);

//EXPORTING AUTH AND DB SO THEY CAN BE USED IN OTHER PAGES
export { auth, db };

import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbXyb_BdBtELbiR2Kyf-yOgKC5Xa01ccY",
  authDomain: "taskbuddy-c8acf.firebaseapp.com",
  projectId: "taskbuddy-c8acf",
  storageBucket: "taskbuddy-c8acf.appspot.com",
  messagingSenderId: "563030545030",
  appId: "1:563030545030:web:2a1deef1f3154c39fd7707",
  measurementId: "G-PD616WQTPG",
  databaseURL: "https://taskbuddy-c8acf-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db } ;
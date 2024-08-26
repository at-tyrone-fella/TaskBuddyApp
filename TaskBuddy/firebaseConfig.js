/**
 * This credential is provided by Firebase to connect to its services.
 */

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

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
const storage = getStorage(app);

module.exports = { auth, db, storage };

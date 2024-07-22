import '../../firebaseConfig'
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../firebaseConfig';

export const addUserProfile = async (userProfileData) => {

  
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {

    const docRef = doc(db, "users", uid);
    await setDoc(docRef, userProfileData);

    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

export const getUserProfiles = async (callback) => {

  
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  onSnapshot(doc(db, "users", uid), (doc) => {
    if(doc.exists()) {
      callback(doc.data());
    } else {
      callback('');
      console.log("No such document!");
    };
  });

};

export const getUserName = async (callback) => {
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  return onSnapshot(doc(db, "users", uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data().username);
    } else {
      callback('');
      console.error("No such document!");
    }
  }, (error) => {
    callback('');
    console.error("Error fetching username:", error);
  });
};

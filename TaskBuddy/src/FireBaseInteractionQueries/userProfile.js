import '../../firebaseConfig'
import {getDoc, doc, setDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../firebaseConfig';

export const addUserProfile = async (userProfileData) => {
  try {
    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");

    const docRef = doc(db, "users", uid);
    await setDoc(docRef, userProfileData);

 //   console.log("Document written with ID: ", docRef.id);
    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

export const getUserProfiles = async () => {
  // Fetch uid from secure Store
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  //console.log("UID after fetch up: ", uid);

  // Fetch the user document with the user ID from the "users" collection
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);


  if (docSnap.exists()) {
    const userProfile = { ...docSnap.data(), id: uid };
  //  console.log("User Profile: ", userProfile);
    return userProfile;
  } else {
    throw new Error("No such document!");
  }
};

export default {addUserProfile, getUserProfiles};
import '../../firebaseConfig';
import { doc, addDoc, onSnapshot, collection, arrayUnion, setDoc, deleteDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../firebaseConfig';
import { updateUserClientProfile } from './userProfile';

export const createClientUser = async (clientData) => {

  console.log("Creating client user");  

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {
    const collRef = collection(db, "clients");
    const docRef = await addDoc(collRef, clientData);

    console.log("Adding client to user profile");
    updateUserClientProfile({ clients: arrayUnion(docRef.id) });
    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

export const createClientOrganization = async (clientData,callback) => {

  console.log("Creating client Organization");  

  try {
    const collRef = collection(db, "clients");
    const docRef = await addDoc(collRef, clientData);
    console.log("Document written with ID: ", docRef.id);

    callback(docRef.id);

    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};


export const getClientDetails = async (clientID, updateCallback) => {
  return new Promise((resolve, reject) => {
    let returnArray = [];
    let remaining = clientID.length;
    const unsubscribeList = [];

    if (remaining === 0) {
      resolve(returnArray);
      return;
    }

    clientID.forEach((client) => {
      const clientDocRef = doc(db, "clients", client);

      const unsubscribe = onSnapshot(
        clientDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            let clientData = docSnapshot.data();
            clientData = { ...clientData, id: docSnapshot.id };

            const index = returnArray.findIndex((org) => org.id === client);
            if (index >= 0) {
              returnArray[index] = clientData;
            } else {
              returnArray.push(clientData);
            }

            if (updateCallback) {
              updateCallback([...returnArray]);
            }
          } else {
            console.log("No such document!");
          }

          remaining -= 1;
          if (remaining === 0) {
            resolve(returnArray);
          }
        },
        (error) => {
          reject(error);
        }
      );

      unsubscribeList.push(unsubscribe);
    });

    return () => {
      unsubscribeList.forEach((unsubscribe) => unsubscribe());
    };
  });
};


export const deleteRedundantClients = (clientData) => {

  try{
    clientData.map(async (client) => {
      const docRef = doc(db, "clients", client);
      await deleteDoc(docRef);
    });

  } catch (e) {
    console.error("Error deleting client: ", e);
    return false;
  }

};

export const fetchUserClients = async (callback) => {

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");


  onSnapshot(doc(db, "users", uid), (doc) => {
    if(doc.exists()) {
      console.log("FetchClient",doc.data().clients);
      callback(doc.data().clients);
    } else {
      callback([]);
      console.log("No such document!");
    };
  });

};

export const getUserClientProfileDetails = async (clientList,callback) => {



  let returnArray = [];

  let remaining = clientList.length;

  const unsubscribeFunctions = [];

  if (remaining === 0) {
    callback([]);
    return;
  }

  clientList.forEach((client) => {
    const clientDocRef = doc(db, "clients", client);

    const unsubscribe = onSnapshot(clientDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        let clientData = docSnapshot.data();
        clientData = { ...clientData, id: docSnapshot.id };
        returnArray.push(clientData);
        if (callback) {
          callback(returnArray);
        }
      } else {
        console.log("No such document!");
      }

      remaining -= 1;
      if (remaining === 0) {
        callback(returnArray); 
      }
    });
    
    unsubscribeFunctions.push(unsubscribe);

  });

  return () => {
    unsubscribeFunctions.forEach(unsub => unsub());
  };

};

export const getUserClientProfiles = async (clientList,callback) => {
  let returnArray = [];
  let unsubscribeFunctions = [];

  if (clientList.length === 0) {
    callback([]); 
    return;
  }

  clientList.forEach((client, index) => {
    const clientDocRef = doc(db, "clients", client);

    const unsubscribe = onSnapshot(clientDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        let clientData = docSnapshot.data();
       
            clientData = { ...clientData, id: docSnapshot.id };
        

        const existingIndex = returnArray.findIndex(item => item.id === clientData.id);
        if (existingIndex >= 0) {
          returnArray[existingIndex] = clientData;
        } else {
          returnArray.push(clientData);
        }

        
        if (index === clientList.length - 1) {
          callback([...returnArray]);  
        }
      } else {
        console.log("No such document!");
      }
    });

    unsubscribeFunctions.push(unsubscribe);
  });

  return () => {
    unsubscribeFunctions.forEach(unsub => unsub());
  };
};


export const updateClientDetails = async (clientID, clientData) => {
    try {
      const docRef = doc(db, "clients", clientID);
      await setDoc(docRef, clientData, { merge: true });
      return true;
    } catch (e) {
      console.error("Error updating document: ", e);
      return false;
    }
};


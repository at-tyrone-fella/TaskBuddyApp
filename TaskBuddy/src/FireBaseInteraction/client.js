import '../../firebaseConfig';
import { doc, addDoc, onSnapshot, collection, arrayUnion, setDoc, deleteDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../firebaseConfig';
import { updateUserClientProfile } from './userProfile';

/**
 * Updates client list for a user
 * @param {JSON} clientData 
 * @returns 
 */
export const createClientUser = async (clientData) => {

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {
    const collRef = collection(db, "clients");
    const docRef = await addDoc(collRef, clientData);

    updateUserClientProfile({ clients: arrayUnion(docRef.id) });
    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

/**
 * Client created from organization form
 * @param {JSON} clientData 
 * @param {function} callback 
 * @returns 
 */
export const createClientOrganization = async (clientData,callback) => {

  try {
    const collRef = collection(db, "clients");
    const docRef = await addDoc(collRef, clientData);
    callback(docRef.id);
    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

/**
 * Fetch Client Details
 * @param {*} clientID 
 * @param {*} updateCallback 
 * @returns 
 */
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


/**
 * Function to delete a client which was created from an organization screen, but the organization was not created. Such redundant cleints should be deleted.
 * @param {} clientData 
 * @returns 
 */
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

/**
 * This function fetcher user clients
 * @param {*} callback 
 */
export const fetchUserClients = async (callback) => {

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");


  onSnapshot(doc(db, "users", uid), (doc) => {
    if(doc.exists()) {
      callback(doc.data().clients);
    } else {
      callback([]);
      console.log("No such document!");
    };
  });

};

/**
 * This function fetches userClientProfiles
 * @param {*} clientList 
 * @param {*} callback 
 * @returns 
 */
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

/**
 * This function fetches user Client Profiles
 * @param {*} clientList 
 * @param {*} callback 
 * @returns 
 */
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

/**
 * This method updates client details
 * @param {*} clientID 
 * @param {*} clientData 
 * @returns 
 */
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


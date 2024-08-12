import '../../firebaseConfig';
import { doc, addDoc, onSnapshot, collection, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

import { db } from '../../firebaseConfig';

export const createOrganization = async (organizationData) => {
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {
    const collRef = collection(db, "organizations");
    const docRef = await addDoc(collRef, organizationData);

    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

export const updateOrganizationMember = async (organizationID, userId) => {
  try {
    const organizationDocRef = doc(db, "organizations", organizationID);
    await updateDoc(organizationDocRef, {
      members: arrayUnion(userId)
    });

    console.log("User added to the members array in organization with ID: ", organizationID);
    return true;
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};

export const updateOrganization = async (organizationID, organizationData) => {
  try {
    const organizationDocRef = doc(db, "organizations", organizationID);
    await setDoc(organizationDocRef, organizationData, { merge: true });
    console.log("Document updated with ID: ", organizationID);
    return true;
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};

export const getOrganizations = async (callback) => {
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  const unsubscribe = onSnapshot(doc(db, "users", uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data().organizations || []);
    } else {
      callback([]);
      console.log("No such document!");
    }
  });

  return unsubscribe;
};

export const getUserOrganizationDetails = async (organizations, updateCallback) => {
  try {
    const orgPromises = organizations.map(async (organizationID) => {
      const organizationDocRef = doc(db, "organizations", organizationID);
      const orgDocSnapshot = await getDoc(organizationDocRef);

      if (orgDocSnapshot.exists()) {
        let orgData = orgDocSnapshot.data();
        orgData = { ...orgData, id: orgDocSnapshot.id };

        if (orgData.clients && orgData.clients.length > 0) {
          const clientQueries = orgData.clients.map(clientID => doc(db, "clients", clientID));
          const clientSnapshots = await Promise.all(clientQueries.map(clientRef => getDoc(clientRef)));

          const clientsData = clientSnapshots.map(clientSnapshot => {
            if (clientSnapshot.exists()) {
              let clientData = clientSnapshot.data();
              return { ...clientData, id: clientSnapshot.id };
            }
            return null;
          }).filter(client => client !== null);

          orgData.clientsDetails = clientsData;

          console.log(`Fetched clients data for organization ID ${organizationID}:`, clientsData);
        }

        return orgData;
      } else {
        console.log(`No such document for organization ID ${organizationID}!`);
        return null;
      }
    });

    const returnArray = (await Promise.all(orgPromises)).filter(org => org !== null);


    if (updateCallback) {
    updateCallback(returnArray);
    }

    return returnArray;
  } catch (error) {
    console.error("Error fetching organization details:", error);
    throw error;
  }
};

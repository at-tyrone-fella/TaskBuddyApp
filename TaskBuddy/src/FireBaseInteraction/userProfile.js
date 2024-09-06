import '../../firebaseConfig'
import { doc, setDoc, getDoc, onSnapshot, updateDoc, getDocs, collection, arrayUnion } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../firebaseConfig';


/**
 * This method updates user profile
 * @param {*} userProfileData 
 * @param {*} member 
 * @returns 
 */
export const updateUserProfile = async (userProfileData, member) => {
  let uid;

  if (member !== undefined) {
    uid = member;
  } else {
    uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");
  }

  const orgID = userProfileData.orgID;

  try {
    const userDocRef = doc(db, "users", uid);
    
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData.organizations) {
        await updateDoc(userDocRef, {
          organizations: arrayUnion(orgID)
        });
      } else {
        await updateDoc(userDocRef, {
          organizations: [orgID]
        });
      }
    } else {
      throw new Error("User document does not exist");
    }

    return true;
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};


/**
 * This method updates user project profile
 * @param {*} projectId 
 * @param {*} member 
 * @returns 
 */
export const updateUserProjectProfile = async (projectId, member) => {
  let uid;

  if (member !== undefined) {
    uid = member;
  } else {
    uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");
  };

  try {
    const userDocRef = doc(db, "users", uid);
    
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData.projects) {
        await updateDoc(userDocRef, {
          projects: arrayUnion(projectId)
        });
      } else {
        await updateDoc(userDocRef, {
          projects: [projectId]
        });
      }
    } else {
      throw new Error("User document does not exist");
    }

    return true;
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};


/**
 * This meethod updates invitation list in user profile of user
 * @param {*} invitationId 
 * @param {*} uid 
 * @returns 
 */
export const updatedUserClientProfileInvitation = async (invitationId, uid) => {

  try {
      const docRef = doc(db, "users", uid);

      await updateDoc(docRef, {
        invitations: arrayUnion(invitationId),
      });
    
      return true;
    } catch (e) {
      console.error("Error adding document: ", e);
      return false;
    }
};

/**
 * This method updates user client profile with new client id
 * @param {*} clientData 
 * @returns 
 */
export const updateUserClientProfile = async (clientData) => {

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        clients: clientData.clients,
      });
    
      return true;
    } catch (e) {
      console.error("Error adding document: ", e);
      return false;
    }
};

/**
 * This mehod updates user profile with organization
 * @param {*} organizationID 
 * @param {*} userId 
 * @returns 
 */
export const addOrganizationToUser = async (organizationID, userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      organizations: arrayUnion(organizationID)
    });

    return true;
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};


/**
 * This method updates user task list in profile
 * @param {*} taskData 
 * @returns 
 */
export const updateUserTaskProfile = async (taskData) => {

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        tasks: arrayUnion(taskData.task),
      });
    
      return true;
    } catch (e) {
      console.error("Error adding document: ", e);
      return false;
    }
};

/**
 * Thismethod updates the user task with the new payload data
 * @param {*} payload 
 * @returns 
 */
export const updateUserTaskList = async (payload) => {
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const tasks = userData.tasks || [];
      const taskIndex = tasks.findIndex(task => task.taskID === payload.taskID);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...payload };
      } else {
        tasks.push({ taskID, ...payload });
      }

      await updateDoc(docRef, { tasks });

      return true;
    } else {
      console.error("No such document!");
      return false;
    }
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};

/**
 * This method updates user profile data with userProfileData
 * @param {*} userProfileData 
 * @returns 
 */
export const addUserProfile = async (userProfileData) => {
  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  try {

    const docRef = doc(db, "users", uid);
    await setDoc(docRef, userProfileData,{merge:true});

    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

/**
 * This method fetches user profile and passes it to callback
 * @param {*} callback 
 */
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


/**
 * This method fetches username of logged in user
 * @param {*} callback 
 * @returns 
 */
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


/**
 * This method filters username and returns array
 * @param {*} username 
 * @param {*} callback 
 */
export const checkUserNames = async (username, callback) => {
  let returnArray = [];
  try{
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      if (doc.data().username === username) {
        returnArray.push({docId: doc.id, username : doc.data().username});
      }
    }
  );

    if(returnArray.length > 0) {
      callback(true, returnArray);
    } else {
      callback(false,[]);
    }
  } catch (e) {
    console.error("Error checking usernames: ", e);
    callback(false,[]);
  }
};


/**
 * This method checks for unique username and passes JSON to callback
 * @param {*} username 
 * @param {*} callback 
 */
export const checkUniqueUserName = async (username, callback) => {
  const querySnapshot = await getDocs(collection(db, "users"));
  let searchResult = false;
  querySnapshot.forEach((doc) => {
    if (doc.data().username === username) {
      callback(true,{docId: doc.id, username : doc.data().username});
      searchResult=true;
    }
  });
  if(!searchResult)
  {
    callback(searchResult);
  }
};


/**
 * This method fetches client list and passes to callback
 * @param {*} callback 
 * @returns 
 */
export const getUserClientProfiles = async (callback) => {

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  return onSnapshot(doc(db, "users", uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data().clients || []);
    } else {
      callback([]);
      console.error("No such document!");
    }
  }, (error) => {
    callback([]);
    console.error("Error fetching clients:", error);
  });

}

/**
 * This method fetches and returns userID and userName of users in a list.
 * @param {*} userList 
 * @returns 
 */
export const getUserMemberDetails = async (userList) => {
  let userDetailsList = [];
  try {
    const userDetailsPromises = userList.map(async (user) => {



      const userDocRef = doc(db, "users", user);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return { userId: userDocSnap.id, username: userDocSnap.data().username };
      } else {
        console.log("No such document!", userId);
        return null;
      }
    });

    const userDetails = await Promise.all(userDetailsPromises);
    userDetailsList = userDetails.filter(userDetail => userDetail !== null);
    return userDetailsList;
  } catch (e) {
    console.error("Error fetching user details: ", e);
    return [];
  }
};


/**
 * This method deletes invitation from user doc
 * @param {*} invitationId 
 * @param {*} userId 
 * @param {*} setLockRefresh 
 * @returns 
 */
export const deleteInvitationFromUser = async (invitationId, userId,setLockRefresh) => {
  setLockRefresh(true);
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);


    if (userDocSnap.exists()) {
      const invitations = userDocSnap.data().invitations || [];
      const updatedInvitations = invitations.filter(invitation => invitation !== invitationId);

      await updateDoc(userDocRef, {
        invitations: updatedInvitations
      });

      setLockRefresh(false);
      return true;
    } else {
      console.log("No such user document!");
      setLockRefresh(false);
      return false;
    }
  } catch (e) {
    console.error("Error updating document: ", e);
    setLockRefresh(false);
    return false;
  }
};

/**
 * This method setup user profile listener to update calendar grid
 * @param {*} setTriggerPoint 
 * @returns 
 */
export const setupUserProfileListener = (setTriggerPoint) => {
  return async () => {
    try {
      const uid = await SecureStore.getItemAsync('userID');
      if (!uid) throw new Error("No user ID found in SecureStore");

      const userProfileRef = doc(db, 'users', uid);

      const unsubscribe = onSnapshot(userProfileRef, () => {

        setTriggerPoint((prevTriggerPoint) => {
          return prevTriggerPoint + 1;
        });
      }, (error) => {
        console.error("Error listening to profile updates:", error);
      });

      return unsubscribe; 
    } catch (error) {
      console.error("Error in setupUserProfileListener:", error);
    }
  };
};
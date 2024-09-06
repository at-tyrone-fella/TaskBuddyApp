import '../../firebaseConfig';
import { doc, addDoc, updateDoc, onSnapshot, collection, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../firebaseConfig';
import { updateOrganization } from './organization';
import { updateUserProjectProfile } from './userProfile';

/**
 * Default project name which tracks personal tasks of user
 */
const DEFAULT_PROJECT_NAME = "%_Personal_Project_%";


/**
 * This method updates a project with payload and return feedback through callback
 * @param {*} projectId 
 * @param {*} payLoad 
 * @param {*} callback 
 */
export const updateProject = async ( projectId , payLoad, callback) => {
  try{
    const projectDoc = doc(db, "projects", projectId);
    await setDoc(projectDoc, payLoad);
    callback(true);
  } catch (e) {
    console.error("Error updating document: ", e);
    callback(false);
  }
};


/**
 * This method fetched default project id for the user
 * @returns 
 */
export const getDefaultProjectId = async () => {
  try {
    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");
    let returnId;
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const projectList = userDocSnap.data().projects;
      for (const project of projectList) {

        const projectRef = doc(db, "projects", project);
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists() && projectDoc.data().projectName === DEFAULT_PROJECT_NAME) {
          console.log(projectDoc.id);
          returnId = projectDoc.id;
        }
      }
      return returnId;
    } else {
      console.log("No data found for this user when fetching project data!");
      return false;
    }
  } catch (error) {
    console.error("Error fetching projects from user:", error);
    return false;
  }
};

/**
 * This method updates project by adding taskID
 * @param {*} projectId 
 * @param {*} taskID 
 * @param {*} callback 
 */
export const updateProjectNewTask = async (projectId, taskID, callback) => {
  try {
    const projectDoc = doc(db, "projects", projectId);
    await updateDoc(projectDoc, {
      tasks: arrayUnion(taskID)
    });
    callback(true);
  } catch (e) {
    console.error("Error updating document: ", e);
    callback(false);
  }
};


/**
 * This method fetches and returns project details of a user
 * @param {*} callback 
 */
export const getProjectsFromUsers = async (callback) => {
  try {
    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");

    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    let returnProjectData = [];

    if (userDocSnap.exists()) {
      const projectList = userDocSnap.data().projects;

      for (const project of projectList) {

        const projectRef = doc(db, "projects", project);
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists() && projectDoc.data().projectName !== DEFAULT_PROJECT_NAME) {
          returnProjectData.push({ project, ...projectDoc.data()});  
        }
      }
      callback(returnProjectData);
    } else {
      console.log("No data found for this user when fetching project data!");
      callback([]);
    }
  } catch (error) {
    console.error("Error fetching projects from user:", error);
    callback([]);
  }
};


/**
 * This method fetches orgID and organizationName and returns.
 * @param {*} callback 
 * @returns 
 */
export const getOrganizations = async (callback) => {
  try {
    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");
    const userDocRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const orgArray = docSnapshot.data().organizations || [];
        if (orgArray.length > 0) {
          const orgPromises = orgArray.map(async (organizationID) => {
            const organizationDocRef = doc(db, "organizations", organizationID);
            const orgDocSnapshot = await getDoc(organizationDocRef);
            if (orgDocSnapshot.exists()) {
              const orgData = orgDocSnapshot.data();
              return { orgId: organizationID, orgName: orgData.organizationName };
            } else {
              return null;
            }
          });
          const orgData = await Promise.all(orgPromises);
          const filteredOrgData = orgData.filter(org => org !== null);
          callback(filteredOrgData);
        } else {
          callback([]);
        }
      } else {
        callback([]);
        console.log("No such document!");
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    callback([]);
  }
};


/**
 * This method fetches organization members and passes it to callback.
 * @param {*} organizationId 
 * @param {*} callback 
 */
export const getOrganizationMembers = async (organizationId, callback) => {
    try {
        const organizationDocRef = doc(db, "organizations", organizationId);
        const orgDocSnapshot = await getDoc(organizationDocRef);
    
        if (orgDocSnapshot.exists()) {
        const memberArray = orgDocSnapshot.data().members || [];
    
        if (memberArray.length > 0) {
            const memberPromises = memberArray.map(async (memberID) => {
            try {
                const memberDocRef = doc(db, "users", memberID);
                const memberDocSnapshot = await getDoc(memberDocRef);
                if (memberDocSnapshot.exists()) {
                const memberData = memberDocSnapshot.data();
                return { memberId: memberID, memberName: memberData.username };
                } else {
                return null;
                }
            } catch (error) {
                console.error(`Error fetching member with ID ${memberID}:`, error);
                return null;
            }
            });
    
            const memberData = await Promise.all(memberPromises);
            const filteredMemberData = memberData.filter(member => member !== null);
            callback(filteredMemberData);
        } else {
            callback([]);
        }
        } else {
        console.log("No such organization document!");
        callback([]);
        }
    } catch (error) {
        console.error("Error fetching organization members:", error);
        callback([]);
    }
};


/**
 * This method fetches and returns clientID and clientName for an organization.
 * @param {*} organizationId 
 * @param {*} callback 
 */
export const getClients = async (organizationId, callback) => {
  try {
    const organizationDocRef = doc(db, "organizations", organizationId);
    const orgDocSnapshot = await getDoc(organizationDocRef);

    if (orgDocSnapshot.exists()) {
      const clientArray = orgDocSnapshot.data().clients || [];

      if (clientArray.length > 0) {
        const clientPromises = clientArray.map(async (clientID) => {
          try {
            const clientDocRef = doc(db, "clients", clientID);
            const clientDocSnapshot = await getDoc(clientDocRef);
            if (clientDocSnapshot.exists()) {
              const clientData = clientDocSnapshot.data();
              return { clientId: clientID, clientName: clientData.clientName };
            } else {
              return null; 
            }
          } catch (error) {
            console.error(`Error fetching client with ID ${clientID}:`, error);
            return null;
          }
        });

        const clientData = await Promise.all(clientPromises);
        const filteredClientData = clientData.filter(client => client !== null);
        callback(filteredClientData);
      } else {
        callback([]);
      }
    } else {
      console.log("No such organization document!");
      callback([]);
    }
  } catch (error) {
    console.error("Error fetching organization clients:", error);
    callback([]);
  }
};

/**
 * This method creates a project from payload
 */
export const createProject = async (payLoad) => {
    try{
        const projectRef = collection(db, "projects");
        const docRef =  await addDoc(projectRef, payLoad);
        await updateOrganization(payLoad.orgId, {projects: arrayUnion(docRef.id)});
        payLoad.members.forEach(async (member) => {
            await updateUserProjectProfile(docRef.id, member);
        });

        return true;
    }  catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};

/**
 * This method create Personal project for a user
 * @param {*} payLoad 
 * @param {*} uniqueId 
 * @returns 
 */
export const createPersonalProject = async (payLoad,uniqueId) => {
  let uid;
  if(uniqueId === undefined){
  uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");
  }
  else{
    uid = uniqueId;
  }
  try{
      const projectRef = collection(db, "projects");
      const docRef =  await addDoc(projectRef, payLoad);
      await updateUserProjectProfile(docRef.id, uid);
      return true;
    }  catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
};


/**
 * This method fetches and returns projectID, projectName for an organization
 * @param {*} projectName 
 * @param {*} orgId 
 * @param {*} callback 
 */
export const checkProjectNames = async (projectName, orgId, callback) => {
  let returnArray = [];

  try {
    const orgRef = doc(db, "organizations", orgId);
    const orgDoc = await getDoc(orgRef);
    const projects = orgDoc.data().projects || [];

    const projectPromises = projects.map(async (project) => {
      const projectRef = doc(db, "projects", project);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.data().projectName === projectName) {
        return { docId: project, projectName: projectDoc.data().projectName };
      } else {
        return null;
      }
    });

    const projectResults = await Promise.all(projectPromises);

    returnArray = projectResults.filter(result => result !== null);

    if (returnArray.length > 0) {
      callback(true, returnArray);
    } else {
      callback(false, []);
    }
  } catch (e) {
    console.error("Error checking project names: ", e);
    callback(false, []);
  }
};
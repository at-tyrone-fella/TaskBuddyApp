import { db } from '../../firebaseConfig.js';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { setDoc, doc, collection } from 'firebase/firestore';
import { createPersonalProject } from '../FireBaseInteractionQueries/projectInteractions.js';


const auth = getAuth();

const createUser = async (email, password, onChangeLoggedInUser, onError) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const collRef = collection(db, 'users');
    const docRef = doc(collRef, user.uid);

    await setDoc(docRef, {
      email: user.email,
    });

    const DEFAULT_PROJECT = {
      projectName: "%_Personal_Project_]%",
    };

    await createPersonalProject(DEFAULT_PROJECT,docRef.id);

    console.log("User records created in db users/");

    onChangeLoggedInUser(user.email);
  } catch (error) {
    console.error("Error creating user and project: ", error);
    const errorCode = error.code;
    onError(errorCode);
  }
};

const getMessages = (errorCode) => {
    switch (errorCode) {
        case "auth/email-already-in-use":
            return "Email already in use.";
        case "auth/invalid-email":
            return "Invalid email.";
        case "auth/weak-password":
            return "Weak password.";
        default:
            return "An unknown error occurred.";
    }
}

export { createUser, getMessages };

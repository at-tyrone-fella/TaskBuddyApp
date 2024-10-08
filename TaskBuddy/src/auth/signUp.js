import { db } from '../../firebaseConfig.js';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { setDoc, doc, collection } from 'firebase/firestore';
import { createPersonalProject } from '../FireBaseInteraction/projectInteractions.js';
import { ABSTRACT_API_KEY } from '../../credentials.jsx'

const auth = getAuth();

const validatePassword = async (password) => {
  if (password.length < 6) {
        return false;
    }

    const upperCaseTrue = /[A-Z]/.test(password);
    const lowerCaseTrue = /[a-z]/.test(password);
    const numberTrue = /[0-9]/.test(password);
    const specialCharTrue = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return upperCaseTrue && lowerCaseTrue && numberTrue && specialCharTrue; 
}


/**
 * Create user profile
 * @param {*} email 
 * @param {*} password 
 * @param {*} onChangeLoggedInUser 
 * @param {*} onError 
 * @returns 
 */
const createUser = async (email, password, onChangeLoggedInUser, onError) => {
  try {

    let userCredential;
    const passwordValid = await validatePassword(password);

    if(passwordValid)
    {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } else {
      onError("auth/weak-password");
      return;
    }
  
    const user = userCredential.user;

    const collRef = collection(db, 'users');
    const docRef = doc(collRef, user.uid);

    await setDoc(docRef, {
      email: user.email,
    });

    const DEFAULT_PROJECT = {
      projectName: "%_Personal_Project_%",
    };

    await createPersonalProject(DEFAULT_PROJECT,docRef.id);

    console.log("User records created in db users/");

    onChangeLoggedInUser(user.email);
  } catch (error) {
    console.error("Error creating user and project: ",error);
    const errorCode = error.code;
    console.log(errorCode)
    onError(errorCode);
  }
};


export const verifyEmail = async (email) => {
  //This key , the email template , and code pience to make API request is provided by Abstract. 
  const apiKey = ABSTRACT_API_KEY;
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}&aut0_correct=${false}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if(data.autocorrect !== "")
    {
      return false;
    }

    //Check if email is deliverable, has valid format, and SMTP is valid
    const isDeliverable = data.deliverability === "DELIVERABLE";
    const isValidFormat = data.is_valid_format.value === true;
    const isSMTPValid = data.is_smtp_valid.value === true;



    return isDeliverable && isValidFormat && isSMTPValid; 

  } catch (error) {
    console.error('Error verifying email:', error);
    return false;
  }
};

/**
 * Convert error codes to meaningful messages
 * @param {*} errorCode 
 * @returns 
 */
const getMessages = (errorCode) => {
    switch (errorCode) {
        case "auth/email-already-in-use":
            return "Email already in use.";
        case "auth/invalid-email":
            return "Invalid email.";
        case "auth/weak-password":
            return("Password should be at least 6 characters long.\n1.Password must have one Uppercase, one Lowercase, a number and a special character.");
        default:
            return "An unknown error occurred.";
    }
}

export { createUser, getMessages };

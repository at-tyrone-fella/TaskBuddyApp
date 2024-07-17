import '../../firebaseConfig.js';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, set, ref } from 'firebase/database';


const auth = getAuth();
const db = getDatabase();



const createUser = (email, password, onChangeLoggedInUser, onError) => {
     createUserWithEmailAndPassword(auth, email, password)
      .then( async (userCredential) => {
        const user = userCredential.user;

        console.log('User created with email: ' + user.email);

        set(ref(db, 'users/' + user.uid + '/'), {
            email: user.email,
        });

        onChangeLoggedInUser(user.email);
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log(errorCode);
        onError(errorCode);
      });
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

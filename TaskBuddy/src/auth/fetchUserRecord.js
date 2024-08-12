import { auth } from '../../firebaseConfig';

export const fetchUserRecord = () => {
    
    const currentUser = auth.currentUser;

    if(currentUser)
    {
        const userEmail = currentUser.email;
        return userEmail;
    }
    else {
        console.log('No user is signed in.');
        return null;
    }
};

export default fetchUserRecord;
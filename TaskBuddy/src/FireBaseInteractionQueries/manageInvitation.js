import '../../firebaseConfig';
import { addDoc, collection, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { updatedUserClientProfileInvitation } from './userProfile';


export const STATUS_VALUES = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DENIED: 'denied',
};


export const createNewInvitation = async (payload, memberID) => {
    try {

        const collRef = collection(db, "invitations");
        const docRef = await addDoc(collRef, payload);
        console.log("Invitation written with ID: ", docRef.id);

        console.log("Adding invitation to user profile");
        await updatedUserClientProfileInvitation({ invitations: arrayUnion(docRef.id) }, memberID);
        
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
};

export const pushInvitationToUser = (userId, invitationId) => {
    console.log("userId: ", userId);
    console.log("InvitationId: ", invitationId);
};

export const updateInvitationStatus = async (invitationId, status) => {
    
    try{

        const invRef = doc(db, "invitations", invitationId);
        const resultUpdate = updateDoc(invRef, { status: status });
        if(resultUpdate)
        {
            return true;
        }
        else {
            return false;
        }
    } catch (e) {
        console.error("Error updating document: ", e);
    }
}

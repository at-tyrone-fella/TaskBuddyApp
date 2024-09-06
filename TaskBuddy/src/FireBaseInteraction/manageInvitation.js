import '../../firebaseConfig';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { updatedUserClientProfileInvitation } from './userProfile';

/**
 * Status for an invitation
 */
export const STATUS_VALUES = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DENIED: 'denied',
};

/**
 * Creates a new invitation for a user.
 * @param {*} payload - It contains information on Organization , User and Message alongwith member lists.
 * @param {*} memberID - It is the id of the user creating the organinzation.
 * @returns - It returns true if invitation created otherwise false.
 */
export const createNewInvitation = async (payload, memberID) => {
    try {

        const collRef = collection(db, "invitations");
        const docRef = await addDoc(collRef, payload);
        await updatedUserClientProfileInvitation(docRef.id, memberID);
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
};

/**
 * Thismethod is used to update the invitation status of a document in invitation collection when user accepts/deny invitaiton
 * @param {} invitationId 
 * @param {*} status 
 * @returns 
 */
export const updateInvitationStatus = async (invitationId, status) => {
    
    try{

        const invRef = doc(db, "invitations", invitationId);
        const resultUpdate = updateDoc(invRef, { data : {status: status} });
        if(resultUpdate)
        {
            return true;
        }
        else {
            return false;
        }
    } catch (e) {
        console.error("Error updating document: ", e);
        return false;
    }
}

/**
 * This method updates pending invitation once user accepts/denies invitation
 * @param {*} uid 
 * @returns 
 */
export const refreshNotificationList = async (uid) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        console.log("No such user document!");
        return [];
    }

    const invitationIds = userDoc.data().invitations || [];

    // Fetch the invitations
    const fetchedInvitations = await Promise.all(
        invitationIds.map(async (invitationId) => {
            const invitationDocRef = doc(db, "invitations", invitationId);
            const inv = await getDoc(invitationDocRef);

            if (inv.exists()) {
                return { id: invitationId, ...inv.data() };
            } else {
                console.log("No such invitation document!");
                return null; 
            }
        })
    );
    return fetchedInvitations.filter(inv => inv !== null);
};


import { Alert } from 'react-native';
import { updateOrganizationMember } from '../FireBaseInteraction/organization';
import { addOrganizationToUser, deleteInvitationFromUser } from '../FireBaseInteraction/userProfile';
import { updateInvitationStatus, STATUS_VALUES, refreshNotificationList } from '../FireBaseInteraction/manageInvitation';

/**
 * This method will handle the accepting of invitation by user
 * @param {*} invitationId 
 * @param {*} invitations 
 * @param {*} uid 
 * @param {*} setInvitations 
 * @param {*} setLockRefresh 
 * @param {*} isUpdating 
 * @param {*} lockRefresh 
 */
export const handleAccept = async (invitationId, invitations, uid, setInvitations, setLockRefresh, isUpdating, lockRefresh) => {
  isUpdating.current = true;
  try {
    const invitationClicked = invitations.find((invitation) => invitation.id === invitationId);

    if (!invitationClicked) {
      throw new Error("Invitation not found");
    }

    const result1 = await updateOrganizationMember(invitationClicked.data.orgId, invitationClicked.data.userId);
    const result2 = await addOrganizationToUser(invitationClicked.data.orgId, invitationClicked.data.userId);
    const result3 = await updateInvitationStatus(invitationId, STATUS_VALUES.ACCEPTED);
    const result4 = await deleteInvitationFromUser(invitationId, invitationClicked.data.userId, setLockRefresh);

    if (result1 && result2 && result3 && result4) {
      Alert.alert("Accepted !!", "You have accepted the invitation.", [{ text: "OK" }]);
    } else {
      Alert.alert("Rejected !!", "You have denied the invitation.", [{ text: "OK" }]);
    }

    if (!lockRefresh) {
      const newInvitationList = await refreshNotificationList(uid);
      setInvitations(newInvitationList);
    }
  } catch (error) {
    console.error("Error handling accept:", error);
  } finally {
    isUpdating.current = false;
  }
};

/**
 * This method will handle the denying of invitation by user
 * @param {*} invitationId 
 * @param {*} invitations 
 * @param {*} uid 
 * @param {*} setInvitations 
 * @param {*} setLockRefresh 
 * @param {*} isUpdating 
 */
export const handleDeny = async (invitationId, invitations, uid, setInvitations, setLockRefresh, isUpdating) => {
  isUpdating.current = true;
  try {
    const invitationClicked = invitations.find((invitation) => invitation.id === invitationId);

    await Promise.all([
      updateInvitationStatus(invitationId, STATUS_VALUES.DENIED),
      deleteInvitationFromUser(invitationId, invitationClicked.data.userId, setLockRefresh),
    ]);

    const newInvitationList = await refreshNotificationList(uid);
    setInvitations(newInvitationList);
  } catch (error) {
    console.error("Error handling deny:", error);
  } finally {
    isUpdating.current = false;
  }
};

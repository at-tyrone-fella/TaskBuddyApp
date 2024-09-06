import { createNewInvitation } from "./manageInvitation";
import { STATUS_VALUES } from "./manageInvitation";

/**
 * This method sends payload message to create a new invitation to the invitations collections.
 * It returns a list of failed invitations that were not created for some users.
 * @param {*} memberList - Member list to send invitation.
 * @param {*} orgName - Organization Name for invitation.
 * @param {*} organizationId - Organization Id for invitation.
 * @returns 
 */
export const sendPayloadMessage = async (memberList, orgName, organizationId) => {
    const failedInvitations = [];
    
    try {
        for (const member of memberList) {
            try {
                const payload = {
                    notification: {
                        title: 'Organization Invitation',
                        body: `You have been invited to join ${orgName}.`,
                    },
                    data: {
                        orgId: organizationId,
                        userId: member,
                        status: STATUS_VALUES.PENDING,
                    },
                };

                const success = await createNewInvitation(payload, member);

                if (!success) {
                    throw new Error(`Failed to create invitation for member ${member}`);
                }

            } catch (error) {
                console.error(`Error sending invitation to member ${member}: `, error);
                failedInvitations.push(member);
            }
        }
        return failedInvitations;
    } catch (error) {
        console.error("Error sending payload messages: ", error);
        return failedInvitations;
    }
};

import { getPushToken } from "./userProfile";
import { createNewInvitation } from "./manageInvitation";
import { STATUS_VALUES } from "./manageInvitation";

const getPushTokenAsync = (member) => {
    return new Promise((resolve, reject) => {
        getPushToken(member, (pushToken) => {
            if (pushToken) {
                resolve(pushToken);
            } else {
                reject(new Error('Push token not found'));
            }
        });
    });
};

export const sendPayloadMessage = async (memberList, orgName, organizationId) => {
    const failedInvitations = [];

    try {
        for (const member of memberList) {
            try {
                const pushToken = true; 
                
                if (!pushToken) {
                    console.warn(`Push token not found for member ${member}`);
                    failedInvitations.push(member);
                    continue; 
                }

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

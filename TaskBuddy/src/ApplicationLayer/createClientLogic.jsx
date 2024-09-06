import { Alert } from 'react-native';
import { createClientUser, createClientOrganization } from "../FireBaseInteraction/client";

/**
 * This metod creates a client
 * @param {*} clientData 
 * @param {*} screenName 
 * @param {*} setClientCreationID 
 * @param {*} setShowCreateClientForm 
 * @returns 
 */
export const createClient = async (clientData, screenName, setClientCreationID, setShowCreateClientForm) => 
  {
  const { clientName, clientBusinessNumber, clientContactNumber, clientAddress, clientEmail, clientLocation } = clientData;

  if (clientName === "" || clientContactNumber === "" || clientEmail === "") {
    return "Please fill in all required fields.";
  }

  const clientSetupData = {
    clientName,
    clientBusinessNumber,
    clientContactNumber,
    clientAddress,
    clientEmail,
    clientLocation,
    isClientActive: true,
  };

  if (screenName === "SetupOrganization") {
    createClientOrganization(clientSetupData, async (clientCreationID) => {
      setClientCreationID(clientCreationID);
      setShowCreateClientForm(false);
    });
  } else {
    const taskStatus = await createClientUser(clientSetupData);

    if (taskStatus) {
      Alert.alert('Client created successfully!', 'New client created.', [
        {
          title: 'Ok',
          onPress: () => {
            setShowCreateClientForm(false);
          },
        },
      ]);
    } else {
      Alert.alert('Client could not be created!', 'Cannot create client at the moment', [
        {
          title: 'Ok',
          onPress: () => {},
        },
      ]);
    }
  }

  return "";
};

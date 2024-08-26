import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { width } from '../utility/DimensionsUtility';
import * as SecureStore from 'expo-secure-store';
import { updateOrganizationMember } from '../FireBaseInteraction/organization';
import { addOrganizationToUser, deleteInvitationFromUser } from '../FireBaseInteraction/userProfile';
import { updateInvitationStatus, STATUS_VALUES, refreshNotificationList } from '../FireBaseInteraction/manageInvitation';

/**
 * This component loads and manages notifications.
 * Bug 1.1 : Identified a bug with re- rendering of the Notification List upon acceptance.
 * This bug becomes particularly irritating for user interface if its the last notification that is accepted.
 * It works fine with deny. This will be fixed in future releases.
 */
const Notification = () => {
  const [invitations, setInvitations] = useState([]);
  const [uid, setUid] = useState(null);
  const [lockRefresh, setLockRefresh] = useState(false);
  const isUpdating = useRef(false);

  // Fetch the UID once on component mount
  useEffect(() => {
    const fetchUid = async () => {
      const userId = await SecureStore.getItemAsync("userID");
      setUid(userId);
    };
    fetchUid();
  }, []);

  useEffect(() => {
    if (!uid || isUpdating.current) return; // Dont reload if an update is in progress

    const userDocRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const invitationIds = userDoc.data().invitations || [];

        const fetchedInvitations = await Promise.all(
          invitationIds.map(async (invitationId) => {
            const invitationDocRef = doc(db, "invitations", invitationId);
            const inv = await getDoc(invitationDocRef);

            if (inv.exists()) {
              return { id: invitationId, ...inv.data() };
            } else {
              return { id: invitationId, error: "No such document" };
            }
          })
        );

        setInvitations(fetchedInvitations);
      } else {
        setInvitations([]);
      }
    });

    return () => unsubscribe();
  }, [uid]);

const handleAccept = async (invitationId) => {
  isUpdating.current = true;
  try {
    console.log("Invitation ID: ", invitationId);

    const invitationClicked = invitations.find((invitation) => invitation.id === invitationId);

    if (!invitationClicked) {
      throw new Error("Invitation not found");
    }

    const result1 = await updateOrganizationMember(invitationClicked.data.orgId, invitationClicked.data.userId);
    const result2 = await addOrganizationToUser(invitationClicked.data.orgId, invitationClicked.data.userId);
    const result3 = await updateInvitationStatus(invitationId, STATUS_VALUES.ACCEPTED);
    const result4 = await deleteInvitationFromUser(invitationId, invitationClicked.data.userId, setLockRefresh);

    console.log(result1,result2,result3,result4);

    if(result1 && result2 && result3 && result4)
    {
      Alert.alert("Accepted !!","You have accepted invitation.",
        [
          { text:"OK" }
        ]
      );
    } else {
      Alert.alert("Rejected !!","You have denied invitation.",
              [
                { text:"OK" }
              ]
            );
    }
   
    if(!lockRefresh)
    {
    const newInvitationList = await refreshNotificationList(uid);
    setInvitations(newInvitationList);
    }
  } catch (error) {
    console.error("Error handling accept:", error);
  } finally {
    isUpdating.current = false;
  }
};


  const handleDeny = async (invitationId) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pending Invitations:</Text>
      {invitations.length > 0 ? (
        invitations.map((invitation) => (
          <View key={invitation.id} style={styles.card}>
            <Text style={styles.title}>{invitation.notification?.title || "No Title"}</Text>
            <Text style={styles.body}>{invitation.notification?.body || "No Body"}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonAccept} onPress={() => handleAccept(invitation.id)}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDeny} onPress={() => handleDeny(invitation.id)}>
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noInvitations}>No invitations yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    width: width * 0.9,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  body: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonAccept: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  buttonDeny: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noInvitations: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Notification;

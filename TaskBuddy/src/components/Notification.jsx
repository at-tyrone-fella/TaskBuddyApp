import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { width, height } from '../utility/DimensionsUtility';
import * as SecureStore from 'expo-secure-store';
import { updateOrganizationMember } from '../FireBaseInteractionQueries/organization';
import { addOrganizationToUser } from '../FireBaseInteractionQueries/userProfile';
import { updateInvitationStatus } from '../FireBaseInteractionQueries/manageInvitation';
import { deleteInvitationFromUser } from '../FireBaseInteractionQueries/userProfile';
import { STATUS_VALUES } from '../FireBaseInteractionQueries/manageInvitation';

const Notification = ({ navigation }) => {
  const [invitations, setInvitations] = useState([]);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userID');
      setUid(storedUserId);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!uid) return; 

    const userDocRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const invitationIds = userDoc.data().invitations || [];

        const fetchedInvitations = await Promise.all(
          invitationIds.map(async (invitationId) => {
            const invitationDocRef = doc(db, "invitations", invitationId);
            const inv = await getDoc(invitationDocRef);

            if (inv.exists()) {
              console.log("Invitation Data: ", inv.data());
              return { id: invitationId, ...inv.data() };
            } else {
              console.log("No such invitation document!");
              return { id: invitationId, error: "No such document" };
            }
          })
        );

        console.log("Fetched Invitations: ", fetchedInvitations);
        setInvitations(fetchedInvitations);
      } else {
        console.log("No such user document!");
        setInvitations([]);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  const handleAccept = async (invitationId) => {

    const invitationClicked = invitations.find((invitation) => invitation.id === invitationId);

    const addMemberToOrganization = await updateOrganizationMember(invitationClicked.data.orgId, invitationClicked.data.userId);

    const addOrganizationToUserProfile = addOrganizationToUser(invitationClicked.data.orgId, invitationClicked.data.userId);

    const updateInvitation = await updateInvitationStatus(invitationId, STATUS_VALUES.ACCEPTED);

    const updateInvitationList =  await deleteInvitationFromUser(invitationId, invitationClicked.data.userId);


  };

  const handleDeny = async (invitationId) => {

    const invitationClicked = invitations.find((invitation) => invitation.id === invitationId);

    const updateInvitation = await updateInvitationStatus(invitationId, STATUS_VALUES.DENIED);

    const updateInvitationList =  await deleteInvitationFromUser(invitationId, invitationClicked.data.userId);

    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pending Invitations: </Text>
      {invitations.length > 0 ? (
        invitations.map((invitation, index) => (
          <View key={invitation.id || index} style={styles.card}>
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

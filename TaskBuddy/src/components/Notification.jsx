import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { width } from '../utility/DimensionsUtility';
import * as SecureStore from 'expo-secure-store';
import { handleAccept, handleDeny } from '../ApplicationLayer/notificationLogic';  

const Notification = () => {

  const [invitations, setInvitations] = useState([]);
  const [uid, setUid] = useState(null);
  const [lockRefresh, setLockRefresh] = useState(false);
  const isUpdating = useRef(false);

  /**
   * Fetch uid from Secure Store
   */
  useEffect(() => {
    const fetchUid = async () => {
      const userId = await SecureStore.getItemAsync("userID");
      setUid(userId);
    };
    fetchUid();
  }, []);

  /**
   * onSnapshot listening for changes to user doc and updating inviation list
   */
  useEffect(() => {
    if (!uid || isUpdating.current) return;

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

  const handleAcceptInvitation = (invitationId) => {
    handleAccept(invitationId, invitations, uid, setInvitations, setLockRefresh, isUpdating, lockRefresh);
  };

  const handleDenyInvitation = (invitationId) => {
    handleDeny(invitationId, invitations, uid, setInvitations, setLockRefresh, isUpdating);
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
              <TouchableOpacity style={styles.buttonAccept} onPress={() => handleAcceptInvitation(invitation.id)}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDeny} onPress={() => handleDenyInvitation(invitation.id)}>
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

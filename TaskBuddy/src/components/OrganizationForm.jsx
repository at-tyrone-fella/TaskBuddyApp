import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, FlatList } from "react-native";
import { Card, Button } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { Alert } from "react-native";
import { getUserClientProfiles } from "../FireBaseInteractionQueries/userProfile";
import { createOrganization } from "../FireBaseInteractionQueries/organization";
import { getClientDetails } from "../FireBaseInteractionQueries/client";
import CreateClient from "./CreateClient";
import SignUpForm from "../components/SignUpForm";
import { debounce } from "lodash";
import { checkUserNames } from "../FireBaseInteractionQueries/userProfile";
import { sendPayloadMessage } from "../FireBaseInteractionQueries/sendNotification";
import * as SecureStore from 'expo-secure-store';

const OrganizationForm = ({ navigation, setShowSidePanel }) => {
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [value, setValue] = useState([]);
  const [items, setItems] = useState([]);
  const [clientCreationID, setClientCreationID] = useState();
  const [username, setUsername] = useState("");
  const [OrganisationClientList, setOrganisationClientList] = useState([]);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showInformation, setShowInformation] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [addUserList, setAddUserList] = useState([]);
  const [fetchedUserData, setFetchedUserData] = useState();
  const [borderColour, setBorderColour] = useState("#ddd");
  const [error, setError] = useState("");

  const checkUsernameExists = useCallback(
    debounce((username) => {
      if (username === "") {
        setBorderColour("#ddd");
        return;
      } else {
        setError("");
        checkUserNames(username, (exists, userData) => {
          if(userData.length > 1)
          {
            setError("Multiple users with the same username exist. Please enter a unique username.");
            setBorderColour("red");
            setButtonDisabled(true);
            return;
          }
          else{
            if (exists) {
              setBorderColour("green");
              setButtonDisabled(false);
              setFetchedUserData(userData[0]);
            } else {
              setBorderColour("red");
              setButtonDisabled(true);
              setFetchedUserData(null);
            }
        }
      });
      }
    }, 3000, { leading: true }),
    [username]
  );

  const handleUsername = (username) => {
    setUsername(username);
    checkUsernameExists(username);
  };

  useEffect(() => {
    if (clientCreationID) {
      let tempOrgList = [...OrganisationClientList, clientCreationID];
      setOrganisationClientList(tempOrgList);

      getClientDetails([clientCreationID], (clientData) => {
        const clientList = clientData.map(client => ({
          label: client.clientName,
          value: client.id,
        }));

        setItems(prevItems => [...prevItems, clientList[0]]);
        setClientCreationID(null);
      });
    }
  }, [clientCreationID]);

  const handleCreateClient = () => {
    setShowCreateClientForm(true);
  };

  const addUser = () => {
    if (fetchedUserData && !addUserList.some((user) => user.id === fetchedUserData.docId)) {
      setAddUserList([...addUserList, fetchedUserData]);
      setFetchedUserData(null);
    } else {
      setError("User record not found or user already added");
    }
  };

  const createNewUser = () => {
    setShowSignUpModal(true);
  };

  const handleSubmit = async () => {

    if (orgName === "" || orgDescription === "") {
      setError("Please fill in all fields.");
      return;
    } 

    else

    {

      const memberList = addUserList.map(user => user.docId);

      memberList.push(await SecureStore.getItemAsync('userID'));

      const organizationSetupData = {
        organizationName: orgName,
        organizationDescription: orgDescription,
        clients: value,
        members: [],
      };

      const orgID = await createOrganization(organizationSetupData);

      if(orgID)
      {
       
        const resultSendMessage = await sendPayloadMessage(memberList,orgName, orgID);
        console.log("Result of sending message:",resultSendMessage);
        if(resultSendMessage.length === 0)
        {
          console.log("Message sent successfully");
          navigation.navigate('HomePage');
        }
        else if(resultSendMessage.length > 0){
          Alert.alert("Error","Invitation can't be sent to all members.Check if users have granted notification permission in app.");
          console.log("Check logs for debugging. Failed invitation: ", resultSendMessage);
        }
        else{
          Alert.alert("Error","Failed to send invitation to members.");
          console.log("Failed to send invitation to members.");
        }

      }
      setShowSidePanel(true);
    }
  };

  const handleRemove = (id) => {
    setAddUserList(prevList => prevList.filter(user => user.docId !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.selectedItem}>{item.username}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.docId)}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    getUserClientProfiles((clients) => {
      getClientDetails(clients, (clientData) => {
        const clientList = clientData.map(client => ({
          label: client.clientName,
          value: client.id,
        }));
        setItems(clientList);
      });
    });
  }, []);

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.text}>Setup Organization</Text>
        <TextInput
          style={styles.input}
          placeholder="Organization Name"
          value={orgName}
          onChangeText={setOrgName}
        />
        <TextInput
          style={styles.input}
          placeholder="Organization Description"
          value={orgDescription}
          onChangeText={setOrgDescription}
        />
        <View style={styles.addClients}>
          {open && (
            <TouchableWithoutFeedback onPress={() => setOpen(false)}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
          )}
          <DropDownPicker
            multiple={true}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            placeholder="Select clients"
            style={styles.dropDownPicker}
            zIndex={3000}
            zIndexInverse={1000}
          />
          <Button mode="contained" onPress={handleCreateClient}>
            Create Client
          </Button>
          {showCreateClientForm && (
            <Modal transparent={true} animationType="fade">
              <TouchableOpacity style={styles.modalBackground} onPress={handleCreateClient}>
                <View style={styles.modalContent}>
                  <CreateClient
                    navigation={navigation}
                    screenName='SetupOrganization'
                    setClientCreationID={setClientCreationID}
                    setShowCreateClientForm={setShowCreateClientForm}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Selected Team Members:</Text>
          <FlatList
            data={addUserList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No members added yet.</Text>}
          />
        </View>
        <View style={styles.addUser}>
          <TextInput
            style={[styles.userInput, { borderColor: borderColour }]}
            placeholder="Enter username"
            value={username}
            onChangeText={handleUsername}
          />
          <Button mode="contained" onPress={addUser} style={styles.addMemberButton} disabled={buttonDisabled}>
            Add
          </Button>
        </View>
        <View style={styles.newUserLink}>
          <TouchableOpacity onPress={createNewUser}>
            <Text style={styles.linkText}>Create a new user.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton} onPress={() => setShowInformation(true)}>
            <Text style={styles.infoButtonText}>i</Text>
          </TouchableOpacity>
        </View>
        {showInformation && (
          <Modal transparent={true} animationType="fade">
            <TouchableOpacity style={styles.tooltipBackground} onPress={() => setShowInformation(false)}>
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  Add a user to your organization by entering their unique username. If the unique username is not yet created, it can be added by editing the User Profile. Click on the link to create a new user. Log in and create a unique username before proceeding with setting up the organization.
                </Text>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
        {showSignUpModal && (
          <Modal transparent={true} animationType="fade">
            <TouchableOpacity style={styles.modalBackground} onPress={() => setShowSignUpModal(false)}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <SignUpForm navigation={navigation}/>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Create Organization
          </Button>
          <Button mode="contained" onPress={() => setShowSidePanel(true)} style={styles.button}>
            Back
          </Button>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 15,
    padding: 15,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  addClients: {
    marginBottom: 20,
  },
  dropDownPicker: {
    width: '95%',
    marginBottom: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedItem: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  addUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    flex: 1,
  },
  addMemberButton: {
    marginLeft: 10,
  },
  newUserLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  infoButton: {
    backgroundColor: '#ccc',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  infoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tooltipBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltip: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tooltipText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default OrganizationForm;

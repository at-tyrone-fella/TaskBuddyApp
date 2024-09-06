import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from "react-native";

import { Card, Button, IconButton } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import * as SecureStore from "expo-secure-store";
import { width, height } from '../utility/DimensionsUtility'
import { getUserClientProfiles } from "../FireBaseInteraction/userProfile";
import { createOrganization } from "../FireBaseInteraction/organization";
import { getClientDetails } from "../FireBaseInteraction/client";
import CreateClient from "./CreateClient";
import SignUpForm from "./SignUpForm";
import { checkUserNames } from "../FireBaseInteraction/userProfile";
import { sendPayloadMessage } from "../FireBaseInteraction/sendNotification";
import { updateOrganizationMember } from "../FireBaseInteraction/organization";
import { addOrganizationToUser } from "../FireBaseInteraction/userProfile";
import { FontPreferences } from "../utility/FontPreferences";

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
      }
      setError("");
      checkUserNames(username, (exists, userData) => {
        if (userData.length > 1) {
          setError("Multiple users with the same username exist. Please enter a unique username.");
          setBorderColour("red");
          setButtonDisabled(true);
          return;
        } else {
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
        const clientList = clientData.map((client) => ({
          label: client.clientName,
          value: client.id,
        }));

        setItems((prevItems) => [...prevItems, clientList[0]]);
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

  const addCreatorToOrganization = async (orgId, userId) => {
    await updateOrganizationMember(orgId, userId);
    await addOrganizationToUser(orgId, userId);
  };

  const handleBack = () => {
    setShowSidePanel(true);
  }

  const handleSubmit = async () => {
    if (orgName === "") {
      setError("Please fill in all fields.");
      return;
    }

    const memberList = addUserList.map((user) => user.docId);
    const organizationSetupData = {
      organizationName: orgName,
      organizationDescription: orgDescription,
      clients: value,
      members: [],
    };

    const orgID = await createOrganization(organizationSetupData);

    if (orgID) {
      await addCreatorToOrganization(orgID, await SecureStore.getItemAsync("userID"));
      const resultSendMessage = await sendPayloadMessage(memberList, orgName, orgID);
      if (resultSendMessage.length === 0) {
        Alert.alert(
          "Organization Created !!",
          "Organization created successfully.",[{
            title:'Ok'
          }]
        );
        navigation.navigate("Organization");
      } else {
        Alert.alert(
          "Error",
          "Invitation can't be sent to all members."
        );
      }
      setShowSidePanel(true);
    }
  };

  const handleRemove = (id) => {
    setAddUserList((prevList) => prevList.filter((user) => user.docId !== id));
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

        let clientListActive = [];
        clientData.map( (client) => {
          if(client.isClientActive)
          {
            clientListActive.push(client);
          }
        }  
        );

        const clientList = clientListActive.map((client) => ({
          
          label: client.clientName,
          value: client.id,
        
        }));
        setItems(clientList);
      });
    });
  }, []);

    const resetStates = useCallback(() => {
    setShowSidePanel(true);
  }, []);

  useFocusEffect(
  useCallback(() => {
    return resetStates;
  }, [setShowSidePanel, resetStates])
);

  OrganizationForm.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
    setShowSidePanel: PropTypes.func.isRequired,
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={{fontSize:FontPreferences.sizes.large, marginLeft: width * 0.15, marginBottom: height * 0.05}}>Create Organization</Text>
        <Text style={styles.text}>Step 1: Setup Organization</Text>
        <TextInput
          style={styles.input}
          placeholder="Organization Name *"
          value={orgName}
          onChangeText={setOrgName}
        />
        <TextInput
          style={styles.input}
          placeholder="Organization Description"
          value={orgDescription}
          onChangeText={setOrgDescription}
        />
        <View style={styles.sectionSeparator} />
        <Text style={styles.text}>Step 2: Add Clients</Text>
        <View style={styles.addClients}>
          <DropDownPicker
            multiple={true}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            placeholder="Select clients"
          />
          <Button mode="contained" onPress={handleCreateClient} style={{marginTop:10}}>
            Create Client
          </Button>
          {showCreateClientForm && (
            <Modal transparent={true} animationType="fade">
              <TouchableOpacity style={styles.modalBackground} onPress={handleCreateClient}>
                <View style={styles.modalContent}>
                  <CreateClient
                    navigation={navigation}
                    screenName="SetupOrganization"
                    setClientCreationID={setClientCreationID}
                    setShowCreateClientForm={setShowCreateClientForm}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
        <View style={styles.sectionSeparator} />
        <Text style={styles.text}>Step 3: Add Team Members</Text>
        <View style={styles.container}>
          <View style={styles.teamHeader}>
            <Text style={styles.title}>Select Team Members</Text>
            <TouchableOpacity style={styles.infoButton} onPress={() => setShowInformation(true)}>
              <IconButton icon="information-outline" size={20} color="blue" />
            </TouchableOpacity>
          </View>
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
        </View>
        {showInformation && (
          <Modal transparent={true} animationType="fade">
            <TouchableOpacity style={styles.tooltipBackground} onPress={() => setShowInformation(false)}>
              <View style={styles.tooltipContainer}>
                <Text style = {{fontSize: FontPreferences.sizes.medium,fontWeight:'bold',marginLeft:width * 0.15}}>How to add a member ?</Text>
                <Text style={styles.tooltipText}>
                  Add existing users to your organization by their username, or create new users if needed.
                  Note : New users need to login and add a username before they can be added.
                </Text>
                 <Text style={styles.tooltipText}>
                  Note : New users need to login and add a username before they can be added.
                </Text>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
          Submit
        </Button>
        <Button mode="contained" onPress={handleBack} style={styles.submitButton}>
          Back
        </Button>
      </View>
      {showSignUpModal && (
        <Modal transparent={true} animationType="fade">
          <TouchableOpacity style={styles.modalBackground} onPress={() => setShowSignUpModal(false)}>
            <View style={styles.modalContent}>
              <SignUpForm
                navigation={navigation}
                setShowSignUpModal={setShowSignUpModal}
                OrganisationClientList={OrganisationClientList}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
    flatListContainer: {
    maxHeight: 200, 
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  addClients: {
    marginBottom: 10,
  },
  sectionSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
   dropDownContainer: {
    maxHeight: 800,
  },
  dropDownPicker: {
    
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  selectedItem: {
    fontSize: 16,
  },
  removeButton: {
    paddingHorizontal: 10,
  },
  removeButtonText: {
    color: "#FF0000",
  },
  userInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    flex: 1,
    marginRight: 10,
  },
  addUser: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addMemberButton: {
    height: 40,
  },
  newUserLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  linkText: {
    color: "#0000FF",
  },
  infoButton: {
    marginLeft: 5,
    padding: 5,
  },
  tooltipBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  tooltipContainer: {
    backgroundColor: "#ffff",
    padding: 10,
    width : width * 0.80,
    height : height * 0.25,
    margin: 10,
    borderRadius: 5,
  },
  tooltipText: {
    fontSize: 16,
    color: "#000",
  },
  submitButton: {
    marginTop: 20,
  },
  emptyText: {
    color: "#aaa",
  },
  error: {
    color: "#FF0000",
    marginTop: 10,
  },
  title: {
    fontWeight: "bold",
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    marginLeft: 0,
  },
});

export default OrganizationForm;

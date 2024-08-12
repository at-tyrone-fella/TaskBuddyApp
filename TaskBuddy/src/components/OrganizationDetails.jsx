import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, FlatList } from "react-native";
import { Card, Button } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { getUserClientProfiles } from "../FireBaseInteractionQueries/userProfile";
import { updateOrganization } from "../FireBaseInteractionQueries/organization";
import { getClientDetails } from "../FireBaseInteractionQueries/client";
import CreateClient from "./CreateClient";
import { checkUserNames } from "../FireBaseInteractionQueries/userProfile";
import { getUserMemberDetails } from "../FireBaseInteractionQueries/userProfile";
import { debounce } from "lodash";

const OrganizationDetails = ({ navigation, organizationData, setShowDetails, setShowSidePanel, setisdataPassed }) => {
  organizationData = organizationData[0];

  const [orgName, setOrgName] = useState(organizationData.organizationName);
  const [orgDescription, setOrgDescription] = useState(organizationData.organizationDescription);
  const [open, setOpen] = useState(false);
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [selectedClients, setSelectedClients] = useState(organizationData.clients || []);
  const [clients, setClients] = useState(organizationData.clients || []);
  const [username, setUsername] = useState("");
  const [newClientList, setNewClientList] = useState([]);
  const [showSignUpModal, setShowSignUpModal] = useState(false);  
  const [showInformation, setShowInformation] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [addUserList, setAddUserList] = useState(organizationData.members || []);
  const [addUserDetailsList, setAddUserDetailsList] = useState([]);
  const [fetchedUserData, setFetchedUserData] = useState();
  const [borderColour, setBorderColour] = useState("#ddd");
  const [items, setItems] = useState([]);
  const [clientCreationID, setClientCreationID] = useState();
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (addUserList && addUserList.length > 0) {
        try {
          const userDetails = await getUserMemberDetails(addUserList);
          setAddUserDetailsList(userDetails);
        } catch (error) {
          console.error("Error fetching user details: ", error);
        }
      } else {
        setAddUserDetailsList([]);
      }
    };
    fetchUserDetails();
  }, [addUserList]);

  useEffect(() => {
    if (clientCreationID) {
      setNewClientList(prevList => [...prevList, clientCreationID]);
      getClientDetails([clientCreationID], (clientData) => {
        const clientList = clientData.map(client => ({
          label: client.clientName,
          value: client.id,
        }));
        setItems(prevItems => [...prevItems, ...clientList]);
        setClientCreationID(null);
      });
    }
  }, [clientCreationID]);

  const handleCreateClient = () => {
    setShowCreateClientForm(true);
  };

  const handleSubmit = () => {
    if (orgName === "" || orgDescription === "") {
      setError("Please fill in all fields.");
      return;
    } else {
      const organizationUpdateData = {
        organizationName: orgName,
        organizationDescription: orgDescription,
        clients: selectedClients,
        members: addUserDetailsList.map(user => user.userId),
      };
      setIsSubmitted(true);
      updateOrganization(organizationData.id, organizationUpdateData).then(() => {
        setShowDetails(false);
        setShowSidePanel(true);
        setisdataPassed(true);
      }).catch(error => {
        console.error("Error updating organization: ", error);
      });
    }
  };

  const handleClientChange = (selectedClients) => {
    setSelectedClients(selectedClients);
  };

  const removeClientFromList = (clientId) => {
    const updatedClients = selectedClients.filter(id => id !== clientId);
    setSelectedClients(updatedClients);
  };

  useEffect(() => {
    getUserClientProfiles((clientss) => {
      const clientsCombined = [...new Set([...clients, ...clientss])];
      getClientDetails(clientsCombined, (clientData) => {
        const clientList = clientData.map(client => ({
          label: client.clientName,
          value: client.id,
        }));
        setItems(clientList);
      });
    });
  }, [clients]);

  const handleUsername = (username) => {
    setUsername(username);
    checkUsernameExists(username);
  };

  const createNewUser = () => {
    setShowSignUpModal(true);
  };

  const checkUsernameExists = useCallback(
    debounce((username) => {
      if (username === "") {
        setBorderColour("#ddd");
        return;
      } else {
        setError("");
        checkUserNames(username, (exists, userData) => {
          if(userData.length > 1) {
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
      }
    }, 3000, { leading: true }),
    [username]
  );

  const handleRemove = (id) => {
    setAddUserDetailsList(prevList => prevList.filter(user => user.userId !== id));
  };

  const addUser = () => {
    if (fetchedUserData && !addUserList.some((user) => user.id === fetchedUserData.docId)) {
      setAddUserList([...addUserList, fetchedUserData]);
      setFetchedUserData(null);
    } else {
      setError("User record not found or user already added");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.selectedItem}>{item.username}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.userId)}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.text}>Edit Organization</Text>
        <Text style={styles.inputLabel}>Organization Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Organization Name"
          value={orgName}
          onChangeText={setOrgName}
        />
        <Text style={styles.inputLabel}>Organization Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Organization Description"
          value={orgDescription}
          onChangeText={setOrgDescription}
        />
        <Text style={styles.label}>Clients:</Text>
        <View style={styles.selectedItemsBox}>
          {selectedClients.length > 0 && selectedClients.map((clientId, index) => {
            const client = items.find(item => item.value === clientId);
            return client ? (
              <View key={index} style={styles.selectedItem}>
                <Text>{client.label}</Text>
                <TouchableOpacity onPress={() => removeClientFromList(client.value)}>
                  <Text style={styles.removeText}>X</Text>
                </TouchableOpacity>
              </View>
            ) : null;
          })}
        </View>
        <View style={styles.addClients}>
          {open && (
            <TouchableWithoutFeedback onPress={() => setOpen(false)}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
          )}
          <DropDownPicker
            multiple={true}
            open={open}
            value={selectedClients}
            items={items}
            setOpen={setOpen}
            setValue={handleClientChange}
            setItems={setItems}
            placeholder="Select clients"
            style={styles.dropDownPicker}
            zIndex={3000}
            zIndexInverse={1000}
          />
          <Button mode="contained" onPress={handleCreateClient}>
            Create Client
          </Button>
        </View>
        {showCreateClientForm && (
          <Modal transparent={true} animationType="fade">
            <TouchableOpacity style={styles.modalBackground} onPress={() => setShowCreateClientForm(false)}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <CreateClient navigation={navigation} screenName='SetupOrganization' setClientCreationID={setClientCreationID} setShowCreateClientForm={setShowCreateClientForm} />
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        )}
        <View style={styles.container}>
          <Text style={styles.title}>Selected Team Members:</Text>
          <FlatList
            data={addUserDetailsList}
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
            Update Organization
          </Button>
          <Button mode="contained" onPress={() => { setShowSidePanel(true); setShowDetails(false) }} style={styles.button}>
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
  inputLabel: {
    fontSize: 12,
    marginVertical: 5,
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
  infoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tooltipText: {
    fontSize: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedItemsBox: {
    margin: 10,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "95%",
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 2000,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginHorizontal: 5,
  },
});

export default OrganizationDetails;

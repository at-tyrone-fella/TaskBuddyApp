import React, { useEffect, useState } from "react";
import { View, SafeAreaView, StyleSheet, Text, Switch } from "react-native";
import Header from "../components/Header.jsx";
import CreateClient from '../components/CreateClient.jsx';
import { Button } from "react-native-paper";
import { fetchUserClients, getUserClientProfiles } from "../FireBaseInteraction/client.js";
import { TouchableOpacity } from "react-native-gesture-handler";
import { width, height } from '../utility/DimensionsUtility.js'
import UpdateClient from "../components/UpdateClient.jsx";
import PropTypes from 'prop-types';

const Client = ({ navigation }) => {

  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [showUpdateClientForm, setShowUpdateClientForm] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [updatedClient, setUpdatedClient] = useState(false);
  const [showActiveClients, setShowActiveClients] = useState(true);  

  const handleCreateClient = () => {
    setShowCreateClientForm(!showCreateClientForm);
  };

  const renderClientDetails = (client) => {
    setSelectedClient(client);
    setShowUpdateClientForm(true);
  }

  const renderClientList = (client) => {
    return (
      <TouchableOpacity key={client.id} onPress={() => renderClientDetails(client)}>
        <View style={[styles.projectBox, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.clientText, { color: '#ffff' }]}>{client.clientName.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    const fetchClientList = async () => {
      try {
        console.log("I am fetching again......")
        const unsubscribe = await fetchUserClients((clientList) => {
          if (clientList && clientList.length > 0) {
            getUserClientProfiles(clientList, async (clientProfiles) => {
              setClientData(clientProfiles);
            });
          } else {
            console.log("No data client")
            setClientData([]);
          }
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    const unsubscribePromise = fetchClientList();
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [updatedClient, showActiveClients]);

  /**
   * Added PropTypes for navigation
   */
  Client.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };

  const filteredClients = showActiveClients
    ? clientData.filter(client => client.isClientActive)
    : clientData;

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.innerContainer}>
        {!showUpdateClientForm && (showCreateClientForm ? (
          <View style={styles.createClientContainer}>
            <CreateClient navigation={navigation} screenName={"createClient"} setShowCreateClientForm={setShowCreateClientForm} />
          </View>
        ) : (
          <>
            <View style={styles.sideContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.sideTitle}>My Clients</Text>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Active Clients</Text>
                  <Switch
                    value={showActiveClients}
                    onValueChange={setShowActiveClients}
                    thumbColor="#ffffff"
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                  />
                </View>
              </View>
              <View style={styles.clientContainer}>
                {filteredClients.map((client) => renderClientList(client))}
              </View>
            </View>
            <View style={styles.mainContainer}>
              <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionHeader}>Welcome to Your Projects</Text>
                  <Text style={styles.descriptionText}>
                    Ready to create something amazing? Start by clicking "Your Project" to manage your personal projects, or "Team Project" to collaborate with your team.
                  </Text>
                  <Text style={styles.descriptionText}>
                    To view or edit the details of an existing project, simply select its name from the list on the side.
                  </Text>
                </View>
              <Button mode="contained" onPress={handleCreateClient} style={{width:width * 0.50}}>Create Client</Button>
            </View>
          </>
        ))
        }
        {
          showUpdateClientForm && (
            <View style={styles.createClientContainer}>
              <UpdateClient
                navigation={navigation}
                screenName={"UpdateClient"}
                setShowUpdateClientForm={setShowUpdateClientForm}
                client={selectedClient}
                setUpdatedClient={setUpdatedClient}
              />
            </View>
          )
        }
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  clientText: {
    fontSize: 16,
    padding: 10,
    textAlign: 'center',
  },
  clientContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sideContainer: {
    width: '46%',
    height: height,
    backgroundColor: '#181F6F',
  },
  sideTitle: {
    fontSize: 20,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffff'
  },
  projectBox: {
    borderWidth: 1,
    width: width * 0.47,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  createClientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  descriptionBox: {
    width: '90%',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20, 
  },
  descriptionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10, 
  },
  mainContainer: {
    padding: 10,
    flexGrow: 1,
    flexDirection: 'column',
    width: '60%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#ffff',
    marginRight: 10,
  },
  titleContainer: {
    alignItems: 'center',
  }
});

export default Client;

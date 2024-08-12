import React, { useEffect, useState } from "react";
import { View, SafeAreaView, StyleSheet, Text } from "react-native";
import Header from "../components/Header.jsx";
import { height, width } from "../utility/DimensionsUtility.js";
import CreateClient from '../components/CreateClient.jsx';
import { Button } from "react-native-paper";
import { fetchUserClients, getUserClientProfiles } from "../FireBaseInteractionQueries/client.js";
import { TouchableOpacity } from "react-native-gesture-handler";
import UpdateClient from "../components/UpdateClient.jsx";

const Client = ({ navigation }) => {

  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [showUpdateClientForm, setShowUpdateClientForm] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [updatedClient, setUpdatedClient] = useState(false);

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
        <Text style={styles.clientText}>{client.clientName}</Text>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    const fetchClientList = async () => {
      try {
        const unsubscribe = await fetchUserClients((clientList) => {
          if (clientList && clientList.length > 0) {
            getUserClientProfiles(clientList, async (clientData) => {
              setClientData(clientData);
            });
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
  }, [updatedClient]);

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.innerContainer}>
        { !showUpdateClientForm && ( showCreateClientForm ? (
          <View style={styles.createClientContainer}>
            <CreateClient navigation={navigation} screenName={"createClient"} setShowCreateClientForm={setShowCreateClientForm} />
          </View>
        ) : (
          <> 
            <View style={styles.sideContainer}>
              <Text style={styles.sideTitle}>My Clients</Text>
              <View style={styles.clientContainer}>
                {clientData.map((client) => renderClientList(client))}
              </View>
            </View> 
            <View style={styles.mainContainer}>
              <Button mode="contained" onPress={handleCreateClient}>Create Client</Button>
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
    width: '40%',
    height: height,
    backgroundColor: 'lightblue',
  },
  sideTitle: {
    fontSize: 20,
    padding: 10,
    textAlign: 'center',
  },
  createClientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Client;

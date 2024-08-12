import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Card, Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { createPersonalProject } from '../FireBaseInteractionQueries/projectInteractions';
import { getUserClientProfiles } from '../FireBaseInteractionQueries/userProfile';
import { getClientDetails } from '../FireBaseInteractionQueries/client';

const ProjectCreationForm = ({ navigation, setShowSidePanel }) => {

  const [selectedClient, setSelectedClient] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [borderColour, setBorderColour] = useState("#ddd");
  const [uniqueMessage, setUniqueMessage] = useState('');
  const [clientItems, setClientItems] = useState([]);
  const [openClient, setOpenClient] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      const clients = await getClients();
      setClientItems(clients.map(client => ({ label: client.name, value: client.id })));
    };

    fetchClients();
  }, []);

  
  useEffect(() => {
    const fetchClients = async () => {
      
        try {
          const clients = await new Promise((resolve, reject) => {
            getUserClientProfiles((data) => {
              resolve(data);
            }, reject);
          });
          console.log("Clients: ", clients); 
          const clientDetails = await getClientDetails(clients);
          const clientItems = clientDetails.map(client => ({ label: client.clientName, value: client.id }));
          console.log("Client Items: ", clientItems);
          setClientItems(clientItems);
        } catch (error) {
          console.error("Error fetching clients: ", error);
        }
      
    };
    
    fetchClients();
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedClient !== null && projectName !== '') {
        setErrorMessage('');
        const payload = {
          projectName: projectName,
          clientId: selectedClient,
          budget: budget,
        };
        const createStatus = await createPersonalProject(payload);
        console.log("Create Status: ", createStatus);
        if (createStatus) {
            Alert.alert('Success', 'Project Created .', [
            {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel',
            },
            {text: 'OK', onPress: () => {setShowSidePanel(true);}},
            ]
        );          
        } else {
          Alert.alert("An error occurred while creating project!");
        }
      } else {
        setErrorMessage('Please fill all required fields.');
      }
    } catch (error) {
      Alert.alert("Error creating project ");
      navigation.goBack();
    }
  };

  const handleGoBack = () => {
    setShowSidePanel(true);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.text}>Create Personal Project</Text>
        
        <TextInput
          style={[styles.input, { borderColor: borderColour }]}
          placeholder="Project Name"
          value={projectName}
          onChangeText={setProjectName}
        />
        {uniqueMessage ? <Text style={{ color: "red" }}>{uniqueMessage}</Text> : null}
        
        <View style={{ zIndex: openClient ? 4000 : 1 }}>
          <DropDownPicker
            open={openClient}
            value={selectedClient}
            items={clientItems}
            setOpen={setOpenClient}
            setValue={setSelectedClient}
            setItems={setClientItems}
            placeholder="Add Client*"
            style={styles.dropDownPicker}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Budget"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />

        <View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Create Project
          </Button>
          <Button mode="contained" onPress={handleGoBack} style={styles.button}>
            Back
          </Button>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
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
  card: {
    margin: 15,
    padding: 15,
  },
  container: {
    flex: 1,
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
  dropDownPicker: {
    marginBottom: 15,
  },
});

export default ProjectCreationForm;

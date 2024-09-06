import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform,Modal } from 'react-native';
import { Card, Button, IconButton } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createPersonalProject } from '../FireBaseInteraction/projectInteractions';
import { getUserClientProfileDetails } from '../FireBaseInteraction/client';
import { width, height } from '../utility/DimensionsUtility'
import { getUserClientProfiles } from '../FireBaseInteraction/userProfile';
import { useFocusEffect } from "@react-navigation/native";

import PropTypes from 'prop-types';

const PersonalProjectForm = ({ navigation, setShowSidePanel }) => {

  const colorList = [
    { id: '1', color: '#E74C3C', label: 'Red' },
    { id: '2', color: '#3498DB', label: 'Light-Blue' },
    { id: '3', color: '#2ECC71', label: 'Light-Green' },
    { id: '4', color: '#E67E22', label: 'Orange' },
    { id: '5', color: '#1F618D', label: 'Dark Blue' },
  ];

  const [selectedClient, setSelectedClient] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [uniqueMessage, setUniqueMessage] = useState('');
  const [clientItems, setClientItems] = useState([]);
  const [openClient, setOpenClient] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [openColor, setOpenColor] = useState(false);

    const resetStates = useCallback(() => {
    setSelectedClient(null);
    setProjectName('');
    setBudget('');
    setUniqueMessage('');
    setSelectedColor(null);
    setStartDate(new Date());
    setEndDate(null);
    setErrorMessage('');
    setShowSidePanel(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return resetStates;
    }, [setShowSidePanel, resetStates])
  );

  useEffect(() => {
    const fetchClients = async () => {
      try {
        await getUserClientProfiles(async (clients) => {
          await getUserClientProfileDetails(clients, (client) => {

        let clientListActive = [];
        client.map((clientEl) => {
            if(clientEl.isClientActive)
            {
              clientListActive.push(clientEl);
            }
          });

            setClientItems(clientListActive.map(client => ({ label: client.clientName, value: client.id })));
          });
        });
      } catch (error) {
        console.error("Error fetching clients: ", error);
      }
    };

    fetchClients();
  }, []);

  const showHelp = () => {
    setHelpVisible(true);
  }

  const hideHelp = () => {
    setHelpVisible(false);
  }

  const handleSubmit = async () => {
    if (!selectedClient || !projectName || !startDate ) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    try {
      setErrorMessage('');
      const payload = {
        projectName,
        clientId: selectedClient,
        budget,
        color: selectedColor,
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : null,
        projectActive: true
      };

      const createStatus = await createPersonalProject(payload);
      if (createStatus) {
        Alert.alert('Success', 'Project Created.', [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'OK', onPress: () => { setShowSidePanel(true); } },
        ]);
      } else {
        Alert.alert("An error occurred while creating project!");
      }
    } catch (error) {
      Alert.alert("Error creating project", "Please contact admin!");
      navigation.goBack();
    }
  };

  const navigateToClient = () => {
    navigation.navigate('CreateClient');
  };


  const handleDateChange = (type, event, selectedDate) => {
    const currentDate = selectedDate || (type === 'start' ? startDate : endDate);
    if (type === 'start') {
      setStartDate(currentDate);
      if (endDate && currentDate > endDate) {
        setEndDate(null);
        Alert.alert('Invalid date', 'End date should not be older than start date.', [{
          title: 'Ok',
        }]);
      }
    } else {
      if (currentDate && startDate && currentDate < startDate) {
        Alert.alert('Invalid date', 'End date should not be older than start date.', [{
          title: 'Ok',
        }]);
        setEndDate(null);
      } else {
        setEndDate(currentDate);
        setErrorMessage('');
      }
    }
    if (event.type === 'set' || event.type === 'dismissed') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={[styles.container]}>
        <View style={{flexDirection:'row'}}>
          <Text style={[styles.text, {marginBottom: "10%"}]}>Create Personal Project</Text>
           <IconButton
          icon="help-circle-outline"
          size={24}
          mode="contained"
          onPress={showHelp}
          style={[{marginLeft:"25%", marginTop:-4}]}
        />
           {(
            <Modal
              visible={helpVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={hideHelp}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Help</Text>
                  <Text style={styles.modalText}>
                    1. Create project for your personal work
                  </Text>
                  <Text style={styles.modalText}>
                    2. Create a new client from My Clients.
                  </Text>
                  <Text style={styles.modalText}>
                    3. Pick a colour for your project. This colour will be used to display your tasks in calendar. If not selected, tasks associated with this task will be displayed in green colour on calendar.
                  </Text>
                  <Button mode="contained" onPress={hideHelp}>OK</Button>
                </View>
              </View>
            </Modal>
          )}
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Step 1: Client & Project Details</Text>

          <Text style={styles.label}>Project Name*</Text>
          <TextInput
            style={[styles.input, { borderColor: "#ddd" }]}
            placeholder="Project Name*"
            value={projectName}
            onChangeText={setProjectName}
          />
          {uniqueMessage && <Text style={styles.errorText}>{uniqueMessage}</Text>}

          <View style={{ zIndex: openClient ? 4000 : 1 }}>
            <Text style={styles.label}>Select Client*</Text>
            <DropDownPicker
              open={openClient}
              value={selectedClient}
              items={clientItems}
              setOpen={setOpenClient}
              setValue={setSelectedClient}
              setItems={setClientItems}
              placeholder="Select Client*"
              style={styles.dropDownPicker}
            />
          </View>
          {(
                <View style={{flexDirection: 'row'}}>
                  <Text>Create a new Client from </Text>
                  <TouchableOpacity onPress={navigateToClient}>
                    <Text style={styles.linkText}> My Clients</Text>
                  </TouchableOpacity>
                </View>
              )
            }
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Step 2: Dates & Budget</Text>

          <Text style={styles.label}>Start Date*</Text>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
            <TextInput
              style={styles.input}
              placeholder="Start Date*"
              value={startDate ? startDate.toLocaleDateString() : ''}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => handleDateChange('start', event, selectedDate)}
            />
          )}

          <Text style={styles.label}>End Date</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {endDate && (
              <TouchableOpacity
                style={[styles.clearButton, { marginTop: -0.5, marginRight: 10 }]}
                onPress={() => {
                  setEndDate(null);
                  setErrorMessage('');
                }}
              >
                <Text style={styles.clearButtonText}>Clear Selection</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="End Date (Optional)"
                value={endDate ? endDate.toLocaleDateString() : ''}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => handleDateChange('end', event, selectedDate)}
            />
          )}

          <Text style={styles.label}>Budget</Text>
          <TextInput
            style={styles.input}
            placeholder="Budget"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.label}>Select Project Color</Text>
          <View style={{ zIndex: openColor ? 1000 : 1 }}>
            <DropDownPicker
              open={openColor}
              value={selectedColor}
              items={colorList.map(color => ({ label: color.label, value: color.color }))}
              setOpen={setOpenColor}
              setValue={setSelectedColor}
              setItems={() => {}}
              placeholder="Select Project Color"
              dropDownContainerStyle={styles.dropDownContainer}
              style={[styles.dropDownPicker, { borderColor: selectedColor || '#ddd' }]}
            />
          </View>
        </View>

        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

        <View style={styles.buttonContainer}>
        
          <Button mode="outlined" onPress={() => setShowSidePanel(true)} style={styles.button}>
            Back
          </Button>
            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Create Project
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
  stepContainer: {
    marginBottom: 30, 
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  dropDownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButton: {
    marginTop: 5,
  },
  clearButtonText: {
    color: 'blue',
  },
    modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: width * 0.8, 
    maxHeight: height * 0.6, 
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
   linkText: {
    fontWeight: 'bold',
    color: 'blue',
  },
});

PersonalProjectForm.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  setShowSidePanel: PropTypes.func.isRequired,
};

export default PersonalProjectForm;

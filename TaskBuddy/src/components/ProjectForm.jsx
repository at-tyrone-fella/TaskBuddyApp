import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform, Modal } from 'react-native';
import { Card, Button, IconButton } from 'react-native-paper';
import { width, height } from '../utility/DimensionsUtility';
import DropDownPicker from 'react-native-dropdown-picker';
import { debounce } from 'lodash';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getOrganizations, getClients, getOrganizationMembers, createProject, checkProjectNames } from '../FireBaseInteraction/projectInteractions';
import PropTypes from 'prop-types';
import { useFocusEffect } from '@react-navigation/native';

const ProjectCreationForm = ({ navigation, setShowSidePanel }) => {
  const colorList = [
    { id: '1', color: '#E74C3C', label: 'Red' },
    { id: '2', color: '#3498DB', label: 'Light-Blue' },
    { id: '3', color: '#2ECC71', label: 'Light-Green' },
    { id: '4', color: '#E67E22', label: 'Orange' },
    { id: '5', color: '#1F618D', label: 'Dark Blue' },
  ];

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [members, setMembers] = useState([]);
  const [borderColour, setBorderColour] = useState("#ddd");
  const [uniqueMessage, setUniqueMessage] = useState('');
  const [orgItems, setOrgItems] = useState([]);
  const [clientItems, setClientItems] = useState([]);
  const [memberItems, setMemberItems] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null); 
  const [openOrg, setOpenOrg] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openMembers, setOpenMembers] = useState(false);
  const [openColor, setOpenColor] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [helpVisible, setHelpVisible] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const debouncedCheckProjectName = useRef(debounce((projectName, selectedOrg) => {
    if (projectName === "") {
      setBorderColour("#ddd");
      return;
    }
    
    setErrorMessage("");
    checkProjectNames(projectName, selectedOrg, (exists, projectData) => {
      if (projectData.length > 1) {
        setErrorMessage("Multiple projects with the same project name exist. Please enter a unique project name.");
        setBorderColour("red");
      } else {
        if (exists) {
          setBorderColour("red");
          setUniqueMessage("Project name already exists. Please enter a unique project name.");
        } else {
          setBorderColour("green");
          setUniqueMessage("Project name available.");
          setProjectName(projectName);
        }
      }
    });
  }, 3000, { leading: true })).current;

  useEffect(() => {
    return () => {
      debouncedCheckProjectName.cancel();
    };
  }, []);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setMembers([]);
      setSelectedClient(null);
      await getOrganizations((organizations) => {
        const orgItems = organizations.map(org => ({ label: org.orgName, value: org.orgId }));
        setOrgItems(orgItems);
      });
    };

    fetchOrganizations();
  }, [selectedOrg]);

  const showHelp = () => {
    setHelpVisible(true);
  }

  const hideHelp = () => {
    setHelpVisible(false);
  }

  useEffect(() => {
    const fetchClients = async () => {
      if (selectedOrg) {
        try {
          const clients = await new Promise((resolve, reject) => {
            getClients(selectedOrg, (data) => {
              resolve(data);
            }, reject);
          });
          const clientItems = clients.map(client => ({ label: client.clientName, value: client.clientId }));
          setClientItems(clientItems);
        } catch (error) {
          console.error("Error fetching clients: ", error);
        }
      }
    };

    const fetchUsers = async () => {
      if (selectedOrg) {
        try {
          const members = await new Promise((resolve, reject) => {
            getOrganizationMembers(selectedOrg, (data) => {
              resolve(data);
            }, reject);
          });
          const memberItems = members.map(member => ({ label: member.memberName, value: member.memberId }));
          setMemberItems(memberItems);
        } catch (error) {
          console.error("Error fetching members: ", error);
        }
      }
    };

    fetchClients();
    fetchUsers();
  }, [selectedOrg]);

  const handleSubmit = async () => {
    try {
      if (selectedOrg !== null && selectedClient !== null && members.length > 0 && projectName !== '') {
        setErrorMessage('');
        const payload = {
          projectName: projectName,
          orgId: selectedOrg,
          clientId: selectedClient,
          budget: budget,
          members: members,
          color: selectedColor,
          startDate: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : null,
          projectActive: true
        };
        const createStatus = await createProject(payload);
        if (createStatus) {
          Alert.alert("Project created successfully!");
          navigation.goBack();
        } else {
          Alert.alert("An error occurred while creating the project!");
        }
      } else {
        setErrorMessage('Please fill all required fields.');
      }
    } catch (error) {
      console.error("Error creating project: ", error);
      Alert.alert("Error creating project.");
      navigation.goBack();
    }
  };

  const formatDropdownLabel = (selectedItems) => {
    if (selectedItems.length > 0) {
      return `${selectedItems.length} ${selectedItems.length === 1 ? 'Member' : 'Members'}`;
    }
    return 'Select Project Members';
  };

  const handleProjectNameChange = (text) => {
    setProjectName(text);
    debouncedCheckProjectName(text, selectedOrg);
  };

  const handleGoBack = () => {
    setShowSidePanel(true);
  };

  const resetStates = useCallback(() => {
    setSelectedOrg(null);
    setSelectedClient(null);
    setProjectName('');
    setBudget('');
    setMembers([]);
    setBorderColour("#ddd");
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

  const navigateToClient = () => {
    navigation.navigate('CreateClient');
  };

  const showDatePicker = (type) => {
    if (type === 'start') {
      setShowStartDatePicker(true);
    } else if (type === 'end') {
      setShowEndDatePicker(true);
    }
  };

  const onChangeStartDate = (event, selectedDate) => {
    if (event.type === 'set') {
      setStartDate(selectedDate || startDate);
    }
    setShowStartDatePicker(false);
  };

  const onChangeEndDate = (event, selectedDate) => {
    if (event.type === 'set') {
      setEndDate(selectedDate || endDate);
    }
    setShowEndDatePicker(false);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <Text style={styles.title}>Create Team Project</Text>
          <IconButton
            icon="help-circle-outline"
            size={24}
            mode="contained"
            onPress={showHelp}
            style={[{marginLeft:"25%", marginTop:-4}]}
          />
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
                  1. Create project for your Team.
                </Text>
                <Text style={styles.modalText}>
                  2. Create a client from My Clients, if it is prompted, before setting up your project and add client to your Organisation.
                </Text>
                <Text style={styles.modalText}>
                  3. Pick a colour for your project. This colour will be used to display your tasks in calendar.
                </Text>
                <Button mode="contained" onPress={hideHelp}>OK</Button>
              </View>
            </View>
          </Modal>
        </View>
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Step 1: Organisation & Client</Text>
          <View>
            <DropDownPicker
              open={openOrg}
              value={selectedOrg}
              items={orgItems}
              setOpen={setOpenOrg}
              setValue={setSelectedOrg}
              setItems={setOrgItems}
              placeholder="Select Organisation*"
              style={styles.dropDownPicker}
            />
          </View>
          <TextInput
            style={[styles.input, { borderColor: borderColour }]}
            placeholder="Project Name *"
            value={projectName}
            onChangeText={handleProjectNameChange}
            editable={selectedOrg !== null}
          />
          {uniqueMessage ? <Text style={styles.errorText}>{uniqueMessage}</Text> : null}
          <View style={{ zIndex: openClient ? 3000 : 1 }}>
            <DropDownPicker
              open={openClient}
              value={selectedClient}
              items={clientItems}
              setOpen={setOpenClient}
              multiple={true}
              setValue={setSelectedClient}
              setItems={setClientItems}
              placeholder="Add Client*"
              style={[styles.dropDownPicker]}
            />
            {
              clientItems.length === 0 ? (
                <View style={{flexDirection: 'row'}}>
                  <Text>Create your first client in </Text>
                  <TouchableOpacity onPress={navigateToClient}>
                    <Text style={styles.linkText}> My Clients</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          </View>
        </View>

        <View style={styles.stepContainerSecond}>
          <Text style={styles.stepTitle}>Step 2: Dates & Budget</Text>
          <Text style={styles.label}>Start Date*</Text>
          <TouchableOpacity onPress={() => showDatePicker('start')}>
            <TextInput
              style={styles.input}
              placeholder="Start Date*"
              value={startDate.toLocaleDateString()}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onChangeStartDate}
            />
          )}
          <View style={{flexDirection:'row'}}>
            <Text style={styles.label}>End Date</Text>
            <Text style={{color:'blue', marginLeft:'5%'}} onPress={() => setEndDate(null)}>Clear selection</Text>
          </View>
          <TouchableOpacity 
            onPress={() => showDatePicker('end')}
          >
            <TextInput
              style={styles.input}
              placeholder="End Date (Optional)"
              value={endDate ? endDate.toLocaleDateString() : ''}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
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
          <Text style={styles.stepTitle}>Step 3: Members & Color</Text>
          <Text style={styles.label}>Project Members *</Text>
          <View style={{ zIndex: openMembers ? 2000 : 1 }}>
            <DropDownPicker
              open={openMembers}
              value={members}
              items={memberItems}
              setOpen={setOpenMembers}
              setValue={setMembers}
              setItems={setMemberItems}
              placeholder={formatDropdownLabel(members)}
              multiple={true}
              style={styles.dropDownPicker}
            />
          </View>
          <Text style={styles.label}>Project Color</Text>
          <View style={{ position: 'relative', zIndex: openColor ? 3000 : 1 }}>
            <DropDownPicker
              open={openColor}
              value={selectedColor}
              items={colorList.map(color => ({ label: color.label, value: color.color }))}
              setOpen={setOpenColor}
              setValue={setSelectedColor}
              setItems={() => {}}
              placeholder="Select Project Color"
              dropDownContainerStyle={styles.dropDownContainer}
              style={[styles.dropDownPicker, { borderColor: selectedColor ? selectedColor : '#ddd' }]}
            />
          </View>
        </View>

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  stepContainerSecond: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    zIndex:-5
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
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
  dropDownContainer: {
    height: 800,
  },
  linkText: {
    fontWeight: 'bold',
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
});

ProjectCreationForm.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  setShowSidePanel: PropTypes.func.isRequired,
};

export default ProjectCreationForm;

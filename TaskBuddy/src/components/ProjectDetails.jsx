import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { debounce } from 'lodash';
import { fetchUserClients, getUserClientProfileDetails } from '../FireBaseInteraction/client';
import { getOrganizations, getClients, getOrganizationMembers, updateProject, checkProjectNames } from '../FireBaseInteraction/projectInteractions';
import PropTypes from 'prop-types';

const ProjectUpdateForm = ({ navigation, projectData, setShowSidePanel, setShowDetails }) => {

  const colorList = [ 
    { id: '1', color: '#E74C3C', label: 'Red' },
    { id: '2', color: '#3498DB', label: 'Light-Blue' },
    { id: '3', color: '#2ECC71', label: 'Light-Green' },
    { id: '4', color: '#E67E22', label: 'Orange' },
    { id: '5', color: '#1F618D', label: 'Dark Blue' },
  ];

  const projectDetails = projectData[0];
  const [selectedOrg, setSelectedOrg] = useState(projectDetails.orgId || null);
  const [selectedClient, setSelectedClient] = useState(projectDetails.clientId[0] || []);
  const [startDate, setStartDate] = useState(projectDetails.startDate ? new Date(projectDetails.startDate) : null);
  const [endDate, setEndDate] = useState(projectDetails.endDate ? new Date(projectDetails.endDate) : null);
  const [projectName, setProjectName] = useState(projectDetails.projectName || '');
  const [budget, setBudget] = useState(projectDetails.budget || '');
  const [members, setMembers] = useState(projectDetails.members || []);
  const [openColor, setOpenColor] = useState(false);
  const [selectedColor, setSelectedColor] = useState(projectDetails.color || null);
  const [borderColour, setBorderColour] = useState("#ddd");
  const [uniqueMessage, setUniqueMessage] = useState('');
  const [projectActive, setProjectActive] = useState(projectDetails.projectActive || false); 
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [orgItems, setOrgItems] = useState([]);
  const [clientItems, setClientItems] = useState([]);
  const [memberItems, setMemberItems] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [openOrg, setOpenOrg] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openMembers, setOpenMembers] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        if (exists && projectData[0].projectId !== projectDetails.projectId) {
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
      setSelectedClient(null);  
      await getOrganizations((organizations) => {
      const orgItems = organizations.map(org => ({ label: org.orgName, value: org.orgId }));
        setOrgItems(orgItems);
      });
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
        try {
          let clients;
          if(selectedOrg)
          {
            clients = await new Promise((resolve, reject) => {
            getClients(selectedOrg, (data) => {
              resolve(data);
            }, reject);
          });

          const clientItems = clients.map(client => ({ label: client.clientName, value: client.clientId }));
          setClientItems(clientItems);
          if (projectDetails.clientId) {
            setSelectedClient(projectDetails.clientId);
          }
          }
          else {
            await fetchUserClients(async(clientList) => {
              await getUserClientProfileDetails(clientList,async (returnArray) => {
                const dataPromise = returnArray.map( (client) => {
                  return{clientId: client.id , clientName: client.clientName}
                })
                clients = await Promise.all(dataPromise);
          const clientItems = clients.map(client => ({ label: client.clientName, value: client.clientId }));
          setClientItems(clientItems);
          if (projectDetails.clientId) {
            setSelectedClient(projectDetails.clientId);
          }

              });
          })
          }  
          
        } catch (error) {
          console.error("Error fetching clients: ", error);
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

  const onChangeStartDate = (event, selectedDate) => {
    if (event.type === 'set') {
      setStartDate(selectedDate || startDate);
    }
    setShowStartDatePicker(false);
  };

const handleSubmit = async () => {
  try {


    if (!selectedOrg && !selectedClient) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    if (selectedOrg && selectedClient && members.length > 0 && projectName !== '') {
      setErrorMessage('');
      const payload = {
        projectName: projectName,
        orgId: selectedOrg,
        clientId: selectedClient,
        budget: budget,
        members: members,
        color: selectedColor,
        projectActive: projectActive,
        
      };

      await updateProject(projectDetails.project, payload, (result) => {
          if (result) {
              Alert.alert("Team Project Updated Successfully");
              handleGoBack();
            } else {
              Alert.alert("Sorry !! Project Update Failed");
            }
      });
      
    } 
    else if (selectedClient && projectName !== '') {
      setErrorMessage('');
      const payload = {
        projectName: projectName,
        clientId: selectedClient,
        budget: budget,
        color: selectedColor,
        projectActive: projectActive,
      };

      await updateProject(projectDetails.project, payload, (result) => {
      if (result) {
        Alert.alert("Personal Project Updated Successfully");
        handleGoBack();
      } else {
        Alert.alert("Sorry !! Project Update Failed");
      }
      });
    } else {
      setErrorMessage('Please fill all required fields.');
    }
  } catch (error) {
    console.error("Error updating project: ", error);
    Alert.alert("Error updating project");
    navigation.goBack();
  }
};

  const onChangeEndDate = (event, selectedDate) => {
    if (event.type === 'set') {
      setEndDate(selectedDate || endDate);
    }
    setShowEndDatePicker(false);
  };

  const showDatePicker = (type) => {
    if (type === 'start') {
      setShowStartDatePicker(true);
    } else if (type === 'end') {
      setShowEndDatePicker(true);
    }
  };


  const formatDropdownLabel = (selectedItems) => {
    if(selectedOrg){
    if (selectedItems.length > 0) {
      return `${selectedItems.length} ${selectedItems.length === 1 ? 'Member' : 'Members'}`;
    }
    return 'Select Project Members*';
  }
  else{
    return 'Only for Team Projects'
  }
  };

  const handleProjectNameChange = (text) => {
    setProjectName(text);
    debouncedCheckProjectName(text, selectedOrg);
  };

  const handleGoBack = () => {
    setShowSidePanel(true);
    setShowDetails(false);
  };

  /*
  Added PropTypes for ProjectDetails 
  */
 
  ProjectUpdateForm.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    projectData: PropTypes.arrayOf(
      PropTypes.shape({
        orgId: PropTypes.string,
        clientId: PropTypes.string,
        projectName: PropTypes.string,
        budget: PropTypes.string,
        members: PropTypes.arrayOf(PropTypes.string),
        projectId: PropTypes.string,
        color: PropTypes.string,
        projectActive: PropTypes.bool,
      })
    ).isRequired,
    setShowSidePanel: PropTypes.func.isRequired,
    setShowDetails: PropTypes.func.isRequired,
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.text}>Update {selectedOrg ? 'Team' : 'Personal'} Project</Text>
        
        <View style={{ zIndex: openOrg ? 5000 : 1 }}>
          <DropDownPicker
            open={openOrg}
            value={selectedOrg}
            items={orgItems}
            setOpen={setOpenOrg}
            setValue={setSelectedOrg}
            setItems={setOrgItems}
            placeholder={selectedOrg ? "Select Organisation*" : 'Only for Team Projects'}
            style={selectedOrg ? styles.dropDownPicker : styles.dropDownPickerDisabled}
            disabled={true}
          />
        </View>
        <TextInput
          style={[styles.input, { borderColor: borderColour }]}
          placeholder="Project Name"
          value={projectName}
          onChangeText={handleProjectNameChange}
          editable={false}
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
            placeholder={"Add Client*"}
            style={styles.dropDownPicker}
            disabled={false}
          />
        </View>
          <View style={{flexDirection:'row'}}>
            <Text style={styles.label}>Start Date *</Text>
            <Text style={{color:'blue', marginLeft:'5%'}} onPress={() => setStartDate(null)}>Clear selection</Text>
          </View>
          <TouchableOpacity onPress={() => showDatePicker('start')}>
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
              value={startDate || new Date()}
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
          {showEndDatePicker && ( startDate !== null ) && (
            <DateTimePicker
              value={endDate || new Date(startDate)}
              minimumDate={new Date(startDate)}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
            />
          )}
        <TextInput
          style={styles.input}
          placeholder="Budget"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />

        <View style={{ zIndex: openMembers ? 3000 : 1 }}>
          <DropDownPicker
            open={openMembers}
            value={members}
            items={memberItems}
            setOpen={setOpenMembers}
            setValue={setMembers}
            setItems={setMemberItems}
            placeholder={formatDropdownLabel(members)}
            multiple={true}
            style={selectedOrg ? styles.dropDownPicker : styles.dropDownPickerDisabled}
            disabled ={!selectedOrg}
          />
        </View>

        <View style={{ zIndex: openColor ? 1000 : 1 }}>
          <DropDownPicker
            open={openColor}
            value={selectedColor}
            items={colorList.map(color => ({ label: color.label, value: color.color }))}
            setOpen={setOpenColor}
            setValue={setSelectedColor}
            setItems={() => {}}
            placeholder="Select Project Color"
            style={[styles.dropDownPicker ,{ borderColor: selectedColor ? selectedColor : '#ddd' }]}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text>Project Active:</Text>
          <Switch
            value={projectActive}
            onValueChange={setProjectActive}
          />
        </View>

        <View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={handleGoBack} style={styles.button}>
            Back
          </Button>
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Update Project
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
    marginBottom: 400
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
  dropDownPickerDisabled: {
    marginBottom: 15,
    borderWidth:0,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default ProjectUpdateForm;

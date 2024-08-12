import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Card, Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { debounce } from 'lodash';
import { getOrganizations, getClients, getOrganizationMembers, createProject, checkProjectNames } from '../FireBaseInteractionQueries/projectInteractions';

const ProjectCreationForm = ({ navigation, setShowSidePanel }) => {
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
      console.log("Project Name sent: ",projectName,"Org ID sent:",selectedOrg);
      console.log("Project data: ", projectData, "Exists: ", exists);
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
    try{
        if(selectedOrg !== null && selectedClient !== null && members.length > 0 && projectName !== '')
        {
            setErrorMessage('');
            const payload = {
                projectName: projectName,
                orgId: selectedOrg,
                clientId: selectedClient,
                budget: budget,
                members: members,
            }
            const createStatus = await createProject(payload);
            if (createStatus) {
                Alert.alert("Project created successfully!");
                navigation.goBack();
            } else {
                Alert.alert("An error occured while creating project!");
            }
        } else {
            setErrorMessage('Please fill all required fields.');
        }
    } catch (error) {
        console.error("Error creating project: ", error);
        Alert.alert("Error creating project: ");
        navigation.goBack();
    }
  };

  const formatDropdownLabel = (selectedItems) => {
    if (selectedItems.length > 0) {
      return `${selectedItems.length} ${selectedItems.length === 1 ? 'Member' : 'Members'}`;
    }
    return 'Select Project Members*';
  };

  const handleProjectNameChange = (text) => {
    setProjectName(text);
    debouncedCheckProjectName(text, selectedOrg);
};

const handleGoBack = () => {
    setShowSidePanel(true);
};

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.text}>Create New Project</Text>
        
        <View style={{ zIndex: openOrg ? 5000 : 1 }}>
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
          style={[styles.input,{borderColor: borderColour}]}
          placeholder="Project Name"
          value={projectName}
          onChangeText={handleProjectNameChange}
          editable={selectedOrg !== null}
        />
        {uniqueMessage? <Text style={{color:"red"}}>{uniqueMessage}</Text> : null }
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
            style={styles.dropDownPicker}
          />
        </View>
        <View>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
        <View style={styles.buttonContainer}>
        
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Create Project
          </Button>
          <Button mode="contained" onPress={() => handleGoBack()} style={styles.button}>
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

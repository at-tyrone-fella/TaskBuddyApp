import React, { useEffect, useState } from "react";
import { View, SafeAreaView, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";
import { Button } from 'react-native-paper';
import Header from "../components/Header.jsx";
import { height, width } from "../utility/DimensionsUtility.js";
import OrganizationForm from "../components/OrganizationForm.jsx";
import { getOrganizations, getUserOrganizationDetails } from "../FireBaseInteraction/organization.js";
import  OrganizationDetails  from "../components/OrganizationDetails.jsx";
import PropTypes from 'prop-types';
import { FontPreferences } from "../utility/FontPreferences.js";


const Organization = ({ navigation }) => {

  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [organizationDetailsState, setOrganizationDetailsState] = useState([]);
  const [organizationData, setOrganizationData] = useState([]);
  const [isdataPassed, setIsDataPassed] = useState(false);

  const handleCreateOrganization = () => {
    setShowSidePanel(!showSidePanel);
  };

  useEffect(() => {
    const fetchUserOrganizations = async () => {
      try {
        const unsubscribe = await getOrganizations(async (organizations) => {
          if (organizations && organizations.length > 0) {
            await getUserOrganizationDetails(organizations, (updatedDetails) => {
              setOrganizationDetailsState(updatedDetails);
            });
          }
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    fetchUserOrganizations();
  }, [isdataPassed]);

  const handlePassOrganization = (key) => {
    setOrganizationData(organizationDetailsState.filter((org) => org.id === key));
  };

  const renderOrganizationNames = (organizationData) => {
    return (
      <TouchableOpacity key={organizationData.id} onPress={() => {
        handlePassOrganization(organizationData.id);
        setShowDetails(true);
        setIsDataPassed(false);
        }}>
      <View style={[styles.projectBox,{ backgroundColor : '#181F6F'}]}>
        <Text style={{color:"#ffff",fontSize : FontPreferences.sizes.medium}}>{organizationData.organizationName}</Text>
      </View>
      </TouchableOpacity>
    );
  };

  /**
   * Added PropTypes for navigation
   */
  Organization.propTypes = {
    navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    }).isRequired,
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Header navigation={navigation} />
        {
          showDetails ? (
            <View style={styles.mainContainer}>
              <OrganizationDetails navigation={navigation} organizationData={organizationData} setShowDetails={setShowDetails} setShowSidePanel= {setShowSidePanel} setisdataPassed={setIsDataPassed} />
            </View>
          ) : (
        
        showSidePanel ? (
          <View style={styles.innerContainer}>
            <View style={styles.sideContainer}>
              <Text style={[styles.sideTitle,{ color:'#ffff', fontWeight:'bold', marginBottom:30 }]}>My Organizations</Text>
              <ScrollView style={styles.sideContainer} contentContainerStyle={{alignItems:'centre'}}>
              <View style={styles.organizations}>
                {organizationDetailsState.map((organizationData) => renderOrganizationNames(organizationData))}
              </View>
              </ScrollView>
            </View>
            <View style={[styles.mainContainer]}>
              <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionHeader}>Start Your Own Organization Here!!</Text>
                  <Text style={styles.descriptionText}>
                  Start your own organization with friends or colleagues. Create and add clients, and gain the ability to initiate new projects. Take the first step—click on "Create Organization" below.
                  </Text>
                  <Text style={styles.descriptionText}>
                    To view or edit the details of an existing project, simply select its name from the list on the side.
                  </Text>
              </View>                  
              <Button onPress={handleCreateOrganization} mode="contained">Create Organization</Button>
            </View>
          </View>
        ) : (
          <OrganizationForm navigation={navigation} setShowSidePanel={setShowSidePanel} />
        )
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  orgNames:{
    margin:5,
  },
  sideContainer: {
    flex: 1,
    flexDirection: "column",
    width: width * 0.45,
    height: height,
    backgroundColor: "#181F6F",
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sideTitle: {
    fontSize: 18,
    color: "rgb(6, 0, 0)",
    marginTop: 20,
    marginLeft: width * 0.05 
  },
  
  descriptionBox: {
    width: '100%',
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
  projectBox: {
  borderWidth: 1,
  width: width * 0.47,
  borderColor: '#ddd', 
  borderRadius: 5,     
  padding: 20,        
  backgroundColor: '#fff', 
  alignItems: 'center',   
  },
  orgItem: {
    padding: 10,
    backgroundColor: "#2E3B4E",
    marginVertical: 5,
    borderRadius: 5,
    width: 100,
  },
  orgName: {
    color: "#FFF",
  },
    projectBox: {
    borderWidth: 1,
    width: width * 0.46,
    borderColor: '#ddd', 
    borderRadius: 5,     
    padding: 10,        
    backgroundColor: '#fff', 
    alignItems: 'center',   
   },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 20,
  },
  organizations: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Organization;

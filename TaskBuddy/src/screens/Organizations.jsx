import React, { useEffect, useState } from "react";
import { View, SafeAreaView, StyleSheet, Text, Button, TouchableOpacity } from "react-native";
import Header from "../components/Header.jsx";
import { height, width } from "../utility/DimensionsUtility.js";
import OrganizationForm from "../components/OrganizationForm.jsx";
import { getOrganizations, getUserOrganizationDetails } from "../FireBaseInteractionQueries/organization";
import  OrganizationDetails  from "../components/OrganizationDetails.jsx";

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
        <Text>{organizationData.organizationName}</Text>
      </TouchableOpacity>
    );
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
              <Text style={styles.sideTitle}>My Organizations</Text>
              <View style={styles.organizations}>
                {organizationDetailsState.map((organizationData) => renderOrganizationNames(organizationData))}
              </View>
            </View>
            <View style={styles.mainContainer}>
              <Button title="Create Organization" onPress={handleCreateOrganization} />
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
  sideContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    width: width * 0.3,
    height: height,
    backgroundColor: "#aaaaff",
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
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

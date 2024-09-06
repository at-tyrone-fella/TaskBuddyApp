import React, { useState, useCallback } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Button } from "react-native-paper";
import Header from "../components/Header.jsx";
import ProjectCreationForm from "../components/ProjectForm.jsx";
import ProjectUpdateForm from "../components/ProjectDetails.jsx";
import PersonalProjectForm from "../components/PersonalProjectForm.jsx";
import { getProjectsFromUsers } from "../FireBaseInteraction/projectInteractions.js";
import { width, height } from "../utility/DimensionsUtility.js";
import { useFocusEffect } from "@react-navigation/native";
import PropTypes from 'prop-types';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../firebaseConfig.js'; 
import * as SecureStore from 'expo-secure-store';
import {FontPreferences} from '../utility/FontPreferences.js'
import { ScrollView } from "react-native-gesture-handler";

const Projects = ({ navigation }) => {
  
  const [showDetails, setShowDetails] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [projectRecord, setProjectRecord] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState([]);
  const [showActiveProjects, setShowActiveProjects] = useState(true); 



  const handleCreateProject = () => {
    setShowSidePanel(false);
    setIsPersonal(false);
  };

  const handleCreatePersonalProject = () => {
    setShowSidePanel(false);
    setIsPersonal(true);
  };

  /**
   * Fetch user projects and store projectid, project name and color
   */
  useFocusEffect(
    useCallback(() => {
      const fetchUserProjects = async () => {
        try {
          const uid = await SecureStore.getItemAsync('userID');
          if (!uid) throw new Error("No user ID found in SecureStore");

          console.log("uid", uid);

          const userRef = doc(db, "users", uid);

          const unsubscribe = onSnapshot(userRef, async (doc) => {
            if (doc.exists) {
              const userData = doc.data();
              const projects = userData.projects || []; 
              setProjectData(projects);
              await getProjectsFromUsers((projects) => {
                setProjectDetails(projects);
                const record = projects.map(({ project, projectName, color }) => ({ project, projectName, color }));
                setProjectRecord(record);
              });
                          } else {
              console.log("No such document!");
            }
          }, (error) => {
            console.error("Error fetching real-time updates:", error);
          });

          return unsubscribe;
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };

      const unsubscribe = fetchUserProjects();

      return () => {
        console.log("Cleaning up subscription...");
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }, [showActiveProjects,showDetails])
  );

  const handlePassProject = (project) => {
    console.log("Project Data getting passed: ", project);
    setSelectedProject(project);
    setShowDetails(true);
  };

  //Render project names
  const renderProjectNames = (projectRecord) => {
    return (
      <View style={[styles.projectContainer,{marginBottom:20}]} key={projectRecord.project}>
        <TouchableOpacity onPress={() => handlePassProject(projectRecord.project)}>
          <View style={[styles.projectBox, {backgroundColor:'transparent'}]}>
            <Text style={[styles.projectName, {fontSize: FontPreferences.sizes.medium}]}>{projectRecord.projectName.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  //Filter active projects
  const filteredProjects = showActiveProjects ? projectDetails.filter((project) => project.projectActive === true) : projectDetails;
  
  Projects.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      {
        showDetails ? 
        (
          <View style={styles.mainContainer}>
            <ProjectUpdateForm
              navigation={navigation}
              projectData={projectDetails.filter((project) => project.project === selectedProject)}
              setShowSidePanel={setShowSidePanel}
              setShowDetails={setShowDetails}
            />
          </View>   
        ) : (
          showSidePanel ? (
            <View style={styles.innerContainer}>
              <View style={styles.sideContainer}>
                <Text style={styles.sideTitle}>My Projects</Text>
                <View style={styles.toggleContainer}>
                  <Text style={[styles.toggleLabel, {marginLeft: 10}]}>Active Projects</Text>
                  <Switch
                    value={showActiveProjects}
                    onValueChange={setShowActiveProjects}
                    thumbColor="#ffffff"
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                  />
                </View>
                <ScrollView style={styles.sideContainer} contentContainerStyle={{ alignItems: "center" }}>
                  <View style={styles.organizations}>
                    {filteredProjects.map((projectData) => renderProjectNames(projectData))}
                  </View>
                </ScrollView>
              </View>
              <View style={styles.mainContainer}>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionHeader}>Welcome to My Projects</Text>
                  <Text style={styles.descriptionText}>
                    Ready to create something amazing? Start by clicking "My Project" to manage your personal projects, or "Team Project" to collaborate with your team.
                  </Text>
                  <Text style={styles.descriptionText}>
                    To view or edit the details of an existing project, simply select its name from the list on the side.
                  </Text>
                </View>
                <Button mode="contained" onPress={handleCreatePersonalProject} style={styles.createButton}>
                  + Your Project
                </Button>
                <Button mode="contained" onPress={handleCreateProject} style={styles.createButton}>
                  + Team Project
                </Button>
              </View>
            </View>
          ) : (
            isPersonal ? 
            (<PersonalProjectForm navigation={navigation} setShowSidePanel={setShowSidePanel} />) : 
            (<ProjectCreationForm navigation={navigation} setShowSidePanel={setShowSidePanel} />)
          )
        )
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sideContainer: {
    flex: 1,
    flexDirection: "column",
    width: width * 0.45,
    height: height,
    backgroundColor: "#181F6F",
    paddingTop: 20,
  },
  sideTitle: {
    fontSize: 18,
    color: "#FFFF",
    bold:true,
    marginBottom: 20,
    marginLeft: width * 0.1,
  },
  organizations: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  projectContainer: {
    marginVertical: 10,  
    width: '100%',      
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
  projectName: {
    fontSize: FontPreferences.sizes.medium,
    color: '#ffff',     
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
  mainContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
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
   sideTitle: {
    fontSize: 20,
    padding: 10,
    marginTop:10,
    marginBottom: 5,
    textAlign: 'center',
    color: '#ffff'
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10, 
  },
  createButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default Projects;

import React, { useState, useCallback } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import Header from "../components/Header.jsx";
import ProjectCreationForm from "../components/ProjectForm.jsx";
import ProjectUpdateForm from "../components/ProjectDetails.jsx";
import PersonslProjectForm from "../components/PersonalProjectForm.jsx";
import { width, height } from "../utility/DimensionsUtility.js";
import { getProjectsFromUsers } from "../FireBaseInteractionQueries/projectInteractions.js";
import { useFocusEffect } from "@react-navigation/native";

const Projects = ({ navigation }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [projectRecord, setProjectRecord] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleCreateProject = () => {
    setShowSidePanel(false);
    setIsPersonal(false);
  };

  const handleCreatePersonalProject = () => {
    setShowSidePanel(false);
    setIsPersonal(true);
  };

  useFocusEffect(
    useCallback(() => {
      const record = projectData.map(({ project, projectName }) => ({ project, projectName }));
      setProjectRecord(record);
    }, [projectData])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchUserProjects = async () => {
        try {
          const unsubscribe = await getProjectsFromUsers((data) => {
            console.log("Project data here: ", data);
            if (data) {
              setProjectData(data);
            }
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
    }, [])
  );

  const handlePassProject = (project) => {
    console.log("Project Data getting passed: ", projectData);
    setSelectedProject(project);
    setShowDetails(true);
  };

  const renderProjectNames = (projectData) => {
    return (
      <TouchableOpacity key={projectData.project} onPress={() => handlePassProject(projectData.project)}>
        <Text>{projectData.projectName}</Text>
      </TouchableOpacity>
    );
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
              projectData={projectData.filter((project) => project.project === selectedProject)}
              setShowSidePanel={setShowSidePanel}
              setShowDetails={setShowDetails}
            />
          </View>   
        ) : (
          showSidePanel ? (
            <View style={styles.innerContainer}>
              <View style={styles.sideContainer}>
                <Text style={styles.sideTitle}>My Projects</Text>
                <View style={styles.organizations}>
                  {projectRecord.map((projectData) => renderProjectNames(projectData))}
                </View>
              </View>
              <View style={styles.mainContainer}>
                <Button mode="contained" onPress={handleCreatePersonalProject} style={styles.createButton}>
                  + Personal Project
                </Button>
                <Button mode="contained" onPress={handleCreateProject} style={styles.createButton}>
                  + Team Project
                </Button>
              </View>
            </View>
          ) : (
            isPersonal ? 
            (<PersonslProjectForm navigation={navigation} setShowSidePanel={setShowSidePanel} />) : 
            (<ProjectCreationForm navigation={navigation} setShowSidePanel={setShowSidePanel} />)
          )
        )
      }
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
    paddingTop: 20,
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
    marginBottom: 20,
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default Projects;

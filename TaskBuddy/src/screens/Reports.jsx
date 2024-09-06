import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ActivityIndicator, Card, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../components/Header.jsx";
import { getProjectsFromUsers } from "../FireBaseInteraction/projectInteractions.js";
import { fetchReportData, parseTaskData } from "../FireBaseInteraction/reports.js";
import { exportToExcel, shareFile } from '../utility/convertToExcel.js';
import PropTypes from 'prop-types';
import { FontPreferences } from "../utility/FontPreferences.js";

const Reports = ({ navigation }) => {
  const [projectRecord, setProjectRecord] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect( () => {
      const fetchUserProjects = async () => {
        try {
          await getProjectsFromUsers((data) => {
            if (data) {
              setProjectRecord(data.map(({ project, projectName }) => ({ project, projectName })));
            }
          });
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };

      fetchUserProjects();

    }, []);

  const handleProjectChange = (projectValue) => {

    setSelectedProject(projectValue);
    setStartDate(new Date());
    setEndDate(new Date());
    setFileUri(null);
    setFileName(null);
  };

  const handleStartDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const currentDate = selectedDate || startDate;
      setStartDate(currentDate);
      if (endDate < currentDate) {
        setEndDate(currentDate);
      }
    }
    setShowStartDatePicker(false); 
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (event.type === "set") { 
      const currentDate = selectedDate || endDate;
      if (currentDate >= startDate) {
        setEndDate(currentDate);
      }
    }
    setShowEndDatePicker(false);
  };

  //Share file triggered
  const postFilePrepShare = async () => {
    if (fileUri) {
      await shareFile(fileUri);
      Alert.alert('Success', 'Report has been exported successfully.');
    } else {
      Alert.alert('Error', 'Failed to create the Excel file.');
    }
  };

  /**
   * This method fetches report data and creates URI
   */
  const handleSubmit = async () => {
    setLoading(true);
    if (selectedProject) {
      try {
        const reportData = await fetchReportData(selectedProject, startDate, endDate);
        const parsedData = await parseTaskData(reportData);
        if (parsedData.length > 0) {

          let projectName = "UnknownProject";

          const selectedProjectObj = projectRecord.find(function(proj) {
              return proj.project === selectedProject;
          });

          if (selectedProjectObj) {
              projectName = selectedProjectObj.projectName;
          }

          const fileName = `TaskReport_${projectName}_${Date.now()}`;
          const fileUri = await exportToExcel(parsedData, fileName);

          if (fileUri) {
            setFileName(fileName);
            setFileUri(fileUri);
          } else {
            Alert.alert('Error', 'Failed to create the Excel file.');
          }
        } else {
          Alert.alert('No Data', 'No data found for the selected project and date range.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch or process report data.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Validation Error', 'Please select a project.');
      setLoading(false);
    }
  };

  return (
    <View>
      <Header navigation={navigation} />
      <View style={styles.innerContainer}>
        <Text style={styles.title}>My Reports</Text>
        {loading ? (
          <ActivityIndicator animating={loading} size="large" color="#0000ff" />
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedProject}
                onValueChange={handleProjectChange}
                style={styles.picker}
                enabled={projectRecord.length > 0}
              >
              <Picker.Item label="Select a project" />   
                {projectRecord.map((projectData) => (
                  <Picker.Item
                    key={projectData.project}
                    label={projectData.projectName}
                    value={projectData.project}
                  />
                ))}
              </Picker>
              </View>
              <View style={styles.dateWrapper}>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.label}>Start Date: {startDate.toDateString()}</Text>
              </TouchableOpacity>
              </View>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                />
              )}
              <View style={styles.dateWrapper}>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.label}>End Date: {endDate.toDateString()}</Text>
              </TouchableOpacity>
              </View>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                />
              )}

              <Button
                onPress={handleSubmit}
                mode="contained"
                disabled={!selectedProject}
              >Fetch Report</Button>
            </Card.Content>
          </Card>
        )}

        {fileUri && (
          <Card style={styles.card}>
              <Text>{fileName}</Text>
              <Button onPress={postFilePrepShare} mode="contained" style={{marginVertical:10}}>SHARE</Button>
          </Card>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    padding: 10,
  },
  pickerWrapper:{
    borderWidth: 1,        
    borderColor: "black",
    borderRadius:10,
   },
   dateWrapper:{
    borderWidth: 1,        
    borderColor: "black",
    borderRadius:10,
    marginBottom: 10,
    marginVertical:10
   },
  picker: {
    height: 35,
    marginBottom: 20,
  },
  label: {
    fontSize: FontPreferences.sizes.medium,
    margin:15
  },
});

Reports.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default Reports;

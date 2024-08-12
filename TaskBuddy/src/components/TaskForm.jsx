import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { Card, Button } from 'react-native-paper';
import { getProjectsFromUsers } from "../FireBaseInteractionQueries/projectInteractions";
import { useFocusEffect } from "@react-navigation/native";
import { createNewTask } from "../FireBaseInteractionQueries/manageTasks";
import { roundToNearestQuarter, convertToUTCZ } from '../utility/timeModifier';
import ImagePickerModal from './ImagePickerModal';

const TaskFormCard = ({ navigation ,isVisible, onClose, returnDateTime }) => {
  const [taskName, setTaskName] = useState('');
  const [startDatetime, setStartDatetime] = useState(null);
  const [endDatetime, setEndDatetime] = useState(null);
  const [projectRecord, setProjectRecord] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [expenseNumber, setExpenseNumber] = useState('');
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [error, setError] = useState('');

  const parseTimestamp = (timestamp) => {
    const dateTime = new Date(timestamp);

    const year = dateTime.getFullYear().toString();
    const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
    const date = dateTime.getDate().toString().padStart(2, '0');
    const hour = dateTime.getHours().toString().padStart(2, '0');
    const minute = dateTime.getMinutes().toString().padStart(2, '0');

    return { year, month, date, hour, minute };
  };

  console.log("ReturnTime: ", returnDateTime);

  const { year, month, date, hour, minute } = parseTimestamp(returnDateTime);

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
  };

  const handleConfirmStartDate = (selectedDate) => {
    if (selectedDate < new Date()) {
      setError('Start time cannot be in the past. Please pick a valid start time.');
      setStartDatetime(new Date());
      hideStartDatePicker();
      return;
    } else {
      setStartDatetime(selectedDate);
      hideStartDatePicker();
      setError('');
      return;
    }
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false);
  };

  const handleConfirmEndDate = (selectedDate) => {
    if (selectedDate < startDatetime) {
      setError('End time cannot be before start time. Please pick a valid end time.');
      setEndDatetime(null);
      hideEndDatePicker();
      return;
    } else {
      setError('');
      setEndDatetime(selectedDate);
      hideEndDatePicker();
      return;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchProjects = async () => {
        try {
          const projectData = await new Promise((resolve, reject) => {
            getProjectsFromUsers((data) => {
              resolve(data);
            });
          });

          const record = projectData.map(({ project, projectName }) => ({ project, projectName }));
          setProjectRecord(record);
          console.log("Project data here: ", record);
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };

      fetchProjects();
    }, [])
  );

  const handleSubmit = async () => {
    setError('');

    if (taskName === '' || startDatetime === null || selectedProject === '') {
      setError('Please fill in all required fields.');
      return;
    } else {
      setError('');

      const repStartDateTime = await roundToNearestQuarter(startDatetime);
      const repEndDateTime = await roundToNearestQuarter(endDatetime);

      console.log(convertToUTCZ(startDatetime));
      console.log(convertToUTCZ(endDatetime));

      const payload = {
        taskName: taskName,
        startDatetime: convertToUTCZ(startDatetime),
        repStartDateTime: repStartDateTime,
        endDatetime: convertToUTCZ(endDatetime),
        repEndDateTime: repEndDateTime,
        expenseAmount: expenseNumber,
        selectedProject: selectedProject,
      };

      console.log("Payload:", payload);

      try {
        const addTaskStatus = await new Promise((resolve) => {
          createNewTask(payload, (res) => {
            resolve(res);
          });
        });

        if (addTaskStatus) {
          console.log("Task added successfully");
          onClose();
        } else {
          console.log("Error adding task");
          setError('Error adding task');
        }
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        setError('Error in submission');
      }
    }
  };

  const handleImagePicked = (image) => {
    setSelectedFile(image);
    setIsImagePickerVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.modalContent}>
        <Card style={styles.card}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Name*"
              value={taskName}
              onChangeText={setTaskName}
            />
            <TouchableOpacity style={styles.datePicker} onPress={showStartDatePicker}>
              <Text style={styles.dateText}>{startDatetime ? `Start: ${startDatetime.toLocaleString()}` : 'Pick Start Time*'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isStartDatePickerVisible}
              mode="datetime"
              date={new Date(year, month - 1, date, hour, minute) || new Date()}
              onConfirm={handleConfirmStartDate}
              onCancel={hideStartDatePicker}
              minimumDate={new Date()}
            />
            <TouchableOpacity style={styles.datePicker} onPress={showEndDatePicker}>
              <Text style={styles.dateText}>{endDatetime ? `End: ${endDatetime.toLocaleString()}` : 'Pick End Time*'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isEndDatePickerVisible}
              mode="datetime"
              onConfirm={handleConfirmEndDate}
              onCancel={hideEndDatePicker}
              minimumDate={new Date(startDatetime)}
            />
            <View style={styles.expenseContainer}>
              <TextInput
                style={styles.expenseInput}
                placeholder="Enter Expense Amount"
                value={expenseNumber}
                onChangeText={setExpenseNumber}
                keyboardType="numeric"
              />
              <Button mode="outlined" onPress={() => setIsImagePickerVisible(true)}  style={styles.receiptButton} >
                + Receipt
              </Button>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedProject}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedProject(itemValue)}
              >
                <Picker.Item label="Select Project*" value="" />
                {projectRecord.map(({ project, projectName }) => (
                  <Picker.Item key={project} label={projectName} value={project} />
                ))}
              </Picker>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Submit
              </Button>
              <Button mode="outlined" onPress={onClose} style={styles.button}>
                Close
              </Button>
            </View>
          </View>
        </Card>
      </View>
       <ImagePickerModal
        isVisible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onImagePicked={handleImagePicked}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 15, 15, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalContainer: {
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  dateText: {
    color: '#333',
  },
  expenseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  expenseInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  receiptButton: {
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    backgroundColor: '#f9f9f9',
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default TaskFormCard;

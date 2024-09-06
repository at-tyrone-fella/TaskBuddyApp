import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { Card, Button } from 'react-native-paper';
import { getProjectsFromUsers, getDefaultProjectId } from '../FireBaseInteraction/projectInteractions';
import { useFocusEffect } from '@react-navigation/native';
import { createNewTask } from '../FireBaseInteraction/manageTasks';
import { roundToNearestQuarter, convertToUTCZ } from '../utility/timeModifier';
import ImagePickerModal from './ImagePickerModal';
import PropTypes from 'prop-types';
import { height, width } from '../utility/DimensionsUtility';

const TaskFormModal = ({ isVisible, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [startDatetime, setStartDatetime] = useState(null);
  const [endDatetime, setEndDatetime] = useState(null);
  const [projectRecord, setProjectRecord] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [receiptFile, setReceiptFile] = useState(null); 
  const [error, setError] = useState('');

  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);

  const handleConfirmStartDate = (selectedDate) => {
    if (selectedDate < new Date()) {
      setError('Start time cannot be in the past. Please pick a valid start time.');
      setStartDatetime(new Date());
    } else {
      setStartDatetime(selectedDate);
      setError('');
    }
    hideStartDatePicker();
  };

  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);

  const handleConfirmEndDate = (selectedDate) => {
    if (selectedDate < startDatetime) {
      setError('End time cannot be before start time. Please pick a valid end time.');
      setEndDatetime(null);
    } else {
      setEndDatetime(selectedDate);
      setError('');
    }
    hideEndDatePicker();
};

  useFocusEffect(
    useCallback(() => {
      const fetchProjects = async () => {
        try {
          const projectData = await new Promise((resolve) => {
            getProjectsFromUsers((data) => resolve(data));
          });
          const projectActiveList = projectData.filter((project) => project.projectActive === true);
          const record = projectActiveList.map(({ project, projectName }) => ({ project, projectName }));
          setProjectRecord(record);
        } catch (error) {
          setError('Error fetching projects');
        }
      };

      fetchProjects();
    }, [])
  );

  const handleSubmit = async () => {
    setError('');

    if(!taskName)
    {
      setError('Please fill all required fields')
      return;
    }

    if (!taskName || !startDatetime || !selectedProject) {

      if(taskName && startDatetime && !selectedProject)
      {
        Alert.alert('Is this your personal task ?','Only personal tasks should be created without a project.',[{
          text:'No',
          onPress: () => {
            return;
          }
      },{
        text:'Yes, Create Task!',
        onPress: () => {
          createPersonalTask();
        }
      }]);
      }
      else{
        createProfessionalTask();
      }
    }
    else{
      createProfessionalTask();
    }

  };

  const createPersonalTask = async () => {

    const Default_Project_Id = await getDefaultProjectId();
    const repStartDateTime = await roundToNearestQuarter(startDatetime);
    const repEndDateTime = await roundToNearestQuarter(endDatetime);

    const payload = {
      taskName,
      startDatetime: convertToUTCZ(startDatetime),
      repStartDateTime,
      endDatetime: convertToUTCZ(endDatetime),
      repEndDateTime,
      expense:[{expenseAmount: expenseAmount,
      expenseDescription: expenseDescription,
      receiptFile: receiptFile}],
      selectedProject: Default_Project_Id,
    };

  try {
      const addTaskStatus = await new Promise((resolve) => {
        createNewTask(payload, (res) => resolve(res));
      });

      if (addTaskStatus) {
        onClose();
      } else {
        setError('Error adding task');
      }
    } catch (error) {
      setError('Error in submission');
  }}

const createProfessionalTask = async () => {

    const repStartDateTime = await roundToNearestQuarter(startDatetime);
    const repEndDateTime = await roundToNearestQuarter(endDatetime);
    const payload = {
      taskName,
      startDatetime: convertToUTCZ(startDatetime),
      repStartDateTime,
      endDatetime: convertToUTCZ(endDatetime),
      repEndDateTime,
      expense:[{expenseAmount: expenseAmount,
      expenseDescription: expenseDescription,receiptFile:receiptFile}],
      selectedProject,
    };

    try {
      const addTaskStatus = await new Promise((resolve) => {
        createNewTask(payload, (res) => resolve(res));
      });

      if (addTaskStatus) {
        onClose();
      } else {
        setError('Error adding task');
      }
    } catch (error) {
      setError('Error in submission');
    }
  }

  const handleImagePicked = () => 
    {
      setIsImagePickerVisible(false);
    }
    
  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
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
              date={startDatetime || new Date()}
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
              date={endDatetime || new Date()}
              onConfirm={handleConfirmEndDate}
              onCancel={hideEndDatePicker}
              minimumDate={startDatetime || new Date()}
            />
            <View style={styles.expenseContainer}>
              <TextInput
                style={styles.expenseInput}
                placeholder="Enter Expense Amount"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="numeric"
              />
              <TextInput style={styles.expenseInput} placeholder='Expense Description' onChangeText={setExpenseDescription}/>
              <Button mode="contained" onPress={() => setIsImagePickerVisible(true)} style={styles.receiptButton}>
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
              
              <Button mode="outlined" onPress={onClose} style={styles.button}>
                Close
              </Button>
              <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Submit
              </Button>  

            </View>
          </View>
        </Card>
      </View>
      <ImagePickerModal
        isVisible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onImagePicked={handleImagePicked}
        setReceiptFile={setReceiptFile}
      />
    </View>
  );
};

TaskFormModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
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
    flexDirection: 'column',
    alignItems: 'stretch',
    height: height * 0.25
  },
  expenseInput: {
    flex: 1,
    marginVertical: height * 0.015,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',

  },
  receiptButton: {
    height: 48,
    justifyContent: 'center',
    marginBottom : height * 0.015,
    marginHorizontal: width * 0.15
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

export default TaskFormModal;

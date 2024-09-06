import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Linking, Modal } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { Card, Button } from 'react-native-paper';
import { getProjectsFromUsers } from '../FireBaseInteraction/projectInteractions';
import { useFocusEffect } from '@react-navigation/native';
import { roundToNearestQuarter, convertToUTCZ } from '../utility/timeModifier';
import ImagePickerModal from './ImagePickerModal';
import { updateTask, fetchExisitngPayload } from '../FireBaseInteraction/manageTasks';
import { updateUserTaskList } from '../FireBaseInteraction/userProfile';
import { width, height} from '../utility/DimensionsUtility';
import PropTypes from 'prop-types';

const UpdateTaskFormCard = ({ isVisible, onClose, task }) => {
  const [startDatetime, setStartDatetime] = useState(new Date(task.startDatetime));
  const [endDatetime, setEndDatetime] = useState(new Date(task.endDatetime));
  const [dateEnabled, setDateEnabled] = useState(true);
  const [endDateEnabled, setEndDateEnabled] = useState(true);
  const [projectRecord, setProjectRecord] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [receipts, setReceipts] = useState(task.receiptFile || []);
  const [taskName, setTaskName] = useState(task.taskName);
  const [receiptFile, setReceiptFile] = useState(null);
  const [expense , setExpense] = useState(task.expense || null);
  const [expenseAmount, setExpenseAmount] = useState(task.expense.expenseAmount || '');
  const [expenseDescription, setExpenseDescription] = useState(task.expense.expenseDescription || []);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(task.selectedProject);
  const [selectedExpenseIndex, setSelectedExpenseIndex] = useState(null);
  const [helpVisible, setHelpVisible] = useState(false);
  const [error, setError] = useState('');

  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);

  useEffect(() => {
    if (receiptFile) {
      setReceipts((prevReceipts) => {
        const receiptsArray = Array.isArray(prevReceipts) ? prevReceipts : [prevReceipts];
        const updatedReceipts = [...receiptsArray, receiptFile];
        return updatedReceipts;
      });
    }
  }, [receiptFile]);

  useFocusEffect(
    useCallback(() => {
      const fetchProjects = async () => {
        try {
          const projectData = await new Promise((resolve) => {
            getProjectsFromUsers((data) => resolve(data));
          });

          const record = projectData.map(({ project, projectName }) => ({ project, projectName }));
          setProjectRecord(record);
        } catch (error) {
          setError('Error fetching projects');
        }
      };

      fetchProjects();
    }, [])
  );

  useEffect(() => {
    handleStartDateEdit();
  }, [startDatetime]);

  useEffect(() => {
    handleEndDateEdit();
  }, [startDatetime, endDatetime]);

  const handleStartDateEdit = () => {
    setDateEnabled(new Date(startDatetime) > new Date());
  };

  const comparePayloads = (oldPayload, newPayload) => {

    let returnFlag = false;

    if(oldPayload.startDatetime !== newPayload.startDatetime || oldPayload.endDatetime !== newPayload.endDateTime)
    {
      returnFlag = true;
    }
    return returnFlag;
  };

  const handleEndDateEdit = () => {
    setEndDateEnabled(startDatetime instanceof Date && !isNaN(startDatetime));
  };

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

    const showHelp = () => {
    setHelpVisible(true);
  }

  const hideHelp = () => {
    setHelpVisible(false);
  }
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

  const handleSubmit = async () => {
    setError('');

    if (taskName === "" || !startDatetime || !selectedProject || selectedProject === "") {
      setError('Please fill in all required fields.');
      return;
    }

    const repStartDateTime = await roundToNearestQuarter(startDatetime);
    const repEndDateTime = await roundToNearestQuarter(endDatetime);

    const payload = {
      taskName: taskName,
      startDatetime: convertToUTCZ(startDatetime),
      repStartDateTime,
      endDatetime: convertToUTCZ(endDatetime),
      repEndDateTime,
      selectedProject,
    };

    const newExpense={   
      expenseAmount: expenseAmount,
      expenseDescription: expenseDescription,
      receiptFile: receiptFile    
    }

    try {
      const addTaskStatus = await new Promise(async (resolve) => {

        updateTask(payload, task.taskID, newExpense, (res) => resolve(res));

        const exisitngData = await fetchExisitngPayload(task.taskID);

        if(comparePayloads(payload, exisitngData))
        {
          const updateUserResult = updateUserTaskList({
              "taskID": task.taskID,
              "startDatetime": payload.startDatetime,
              "endDatetime": payload.endDatetime,
          })
          if(updateUserResult)
          {
            console.log("Task Updated successfully")
          }
        }
        else{
          console.log("Nothing changed")
        }
      });

      if (addTaskStatus) {
        onClose();
      } else {
        setError('Error updating task');
      }
    } catch (error) {
      setError('Error in submission');
    }
  };

  handleReceiptPress = async (receipt) => {
    const supported = await Linking.canOpenURL(receipt);
    try {
      if(supported) {
      await Linking.openURL(receipt);
      }
    } catch (error) {
      console.error("Error opening receipt:", error);
    }
  };

const handleExpensePress = (index) => {
  setSelectedExpenseIndex(index === selectedExpenseIndex ? null : index);
};
const renderExpense = (individualExpense, index) => {

  const isSelected = selectedExpenseIndex === index;

  return (
    <View key={index} style={styles.expenseContainer}>
      <Button onPress={() => handleExpensePress(index)}>Expense {index + 1}</Button>
      {isSelected && (
        <View>
          <Text style={styles.modalText}>Expense Amount: {individualExpense.expenseAmount}</Text>
          <Text style={styles.modalText}>Description: {individualExpense.expenseDescription}</Text>
          <TouchableOpacity onPress={() => handleReceiptPress(individualExpense.receiptFile)}>
            <Text style={[styles.modalText, { color: 'blue' }]}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

  const handleImagePicked = () => setIsImagePickerVisible(false);

 if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
        <Card style={styles.card}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Task</Text>

            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={taskName}
              editable={false}
            />

            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              style={[styles.datePicker, !dateEnabled && styles.disabledInput]}
              pointerEvents={dateEnabled ? 'none' : 'auto'}
              onPress={() =>
                dateEnabled ? showStartDatePicker() : ''
              }
            >
              <Text style={styles.dateText}>
                {startDatetime ? `Start: ${startDatetime.toLocaleString()}` : 'Pick Start Time*'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isStartDatePickerVisible}
              mode="datetime"
              date={startDatetime || new Date()}
              onConfirm={handleConfirmStartDate}
              onCancel={hideStartDatePicker}
              minimumDate={new Date()}
            />

            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              style={[styles.datePicker, !dateEnabled && styles.disabledInput]}
              pointerEvents={!dateEnabled ? 'none' : 'auto'}
              onPress={() => {
                dateEnabled ? showEndDatePicker() : '';
              }}
            >
              <Text style={styles.dateText}>
                {endDatetime ? `End: ${endDatetime.toLocaleString()}` : 'Pick End Time*'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isEndDatePickerVisible}
              mode="datetime"
              date={endDatetime || new Date()}
              onConfirm={handleConfirmEndDate}
              onCancel={hideEndDatePicker}
              minimumDate={startDatetime || new Date()}
            />

            <Text style={styles.label}>Expense Amount</Text>
            <View style={styles.expenseContainer}>
              <TextInput
                style={styles.expenseInput}
                placeholder="Amount"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="numeric"
              />
              <TextInput style={styles.expenseInput} placeholder="Description" value = {expenseDescription} onChangeText={setExpenseDescription}/>
              <Button mode="outlined" onPress={() => setIsImagePickerVisible(true)} style={styles.receiptButton}>
                + 
              </Button>
            </View>
            <Button mode = "contained" style = {{marginVertical:10}} onPress={() => showHelp()}>View Current Expenses</Button>
          { <Modal
          visible={helpVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={hideHelp}
        >

          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Current Expenses</Text>
            {
              expense.map((individualExpense, index) => 
              renderExpense(individualExpense,index)
              )
            }
              <Button mode="contained" onPress={hideHelp}>Close</Button>
            </View>
          </View>
        </Modal>
        }   
            <Text style={styles.label}>Project</Text>
            <View style={[styles.pickerWrapper, styles.disabledInput]}>
              <Picker
                selectedValue={selectedProject}
                style={styles.picker}
                onValueChange={() => { }}
                enabled={false}
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
      <ImagePickerModal
        isVisible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onImagePicked={handleImagePicked}
        setReceiptFile={setReceiptFile}
      />
    </View>
  );
};

UpdateTaskFormCard.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  task: PropTypes.object.isRequired,
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
    width: '100%',
    maxWidth: 400,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  card: {
    width: '90%',
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
  label: {
    marginBottom: 5,
    fontSize: 16,
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
  disabledInput: {
    opacity: 0.5,
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

export default UpdateTaskFormCard;

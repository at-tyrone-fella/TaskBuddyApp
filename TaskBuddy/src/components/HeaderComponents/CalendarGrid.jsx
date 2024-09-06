import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import moment from 'moment';
import { FontPreferences } from '../../utility/FontPreferences';  
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchTasks, getTaskHoursForDay } from '../../FireBaseInteraction/manageTasks'; 
import { setupUserProfileListener } from '../../FireBaseInteraction/userProfile';
import { calculateHourlyProportions, getBoxStyle } from '../../ApplicationLayer/calendargridLogic';  
import { width, height } from '../../utility/DimensionsUtility';
import PropTypes from 'prop-types';

const CalendarGrid = ({ calendarState, setCalendarState, setCalendarColour, setShowTaskModal, setReturnDateTime, setShowUpdateTaskModal, setUpdateTask }) => {
  
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [tasks, setTasks] = useState([]);
  const [taskHours, setTaskHours] = useState([]);
  const [triggerPoint, setTriggerPoint] = useState(0);
  const [helpVisible, setHelpVisible] = useState(false);
  const scrollViewRef = useRef(null);

  /**
   * This useEffect fetches and stores all task details for selected date
   */
  useEffect(() => {
    const getTasksForDate = async (date) => {
      try {
        const tasksForDay = await fetchTasks(date);
        const tasksWithDisplayDetails = await Promise.all(tasksForDay.map(async (task) => {
          const taskDisplayDetails = await getTaskHoursForDay(task.repStartDateTime, task.repEndDateTime, date);
          return { ...task, ...taskDisplayDetails };
        }));
        const promiseReturned = await Promise.all(tasksWithDisplayDetails);
        
        setTasks(promiseReturned);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    getTasksForDate(selectedDate);
  }, [selectedDate, triggerPoint]);

  /**
   * This useEffect each tasks hourly proportions and sets the taskID, its proportions and the direction.
   * Proportion is the portion of the hour occupied
   * Direction is the 
   */
  useEffect(() => {
    const calcTaskHourProportions = async () => {
      const tasksPromise = await Promise.all(
        tasks.map(async (task) => {
          const { taskID, proportions, directions } = await calculateHourlyProportions(task.startTime, task.endTime, task.taskID);
          return { taskID, proportions, directions };
        })
      );
      setTaskHours(tasksPromise);
    };

    calcTaskHourProportions();
  }, [tasks]);

  useEffect(() => {
    const initializeListener = async () => {
      return await setupUserProfileListener(setTriggerPoint)();
    };

    let unsubscribe;  

    initializeListener().then(unsub => {
      unsubscribe = unsub;  
    }).catch(error => {
      console.error("Error initializing listener:", error);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const onChange = (event, date) => {
    if (date) {
      setCalendarState(false);
      setSelectedDate(moment(date).format('YYYY-MM-DD'));
    }
  };

  const showHelp = () => {
    setHelpVisible(true);
  };

  const hideHelp = () => {
    setHelpVisible(false);
  };

  /**
   * Fixes colour of calendar in the header.
   */
  useEffect(() => {
    if (!calendarState) {
      setCalendarColour('#D3D3D3');
    } 
  }, [calendarState]);

  /**
   * Creating an array of hours.
   */
  const hours = Array.from({ length: 24 }, (_, i) => i);

  /**
   * This method calculates dates for hour banner
   * @param {*} numDays 
   * @returns 
   */
  const getDates = (numDays) => {
    const today = selectedDate ? moment(selectedDate) : moment();
    return Array.from({ length: numDays * 2 + 1 }, (_, i) =>
      today.clone().add(i - numDays, 'days')
    );
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedDate(moment(selectedDate).format('YYYY-MM-DD'));
    }, [selectedDate])
  );

  const numDays = 15; 
  const dates = getDates(numDays);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: (numDays * 38), animated: true });
    }
  }, [numDays]);


  /**
   * This method will render each hour row
   * @param {*} hour 
   * @returns 
   */
  const renderHourCell = (hour) => {
    
    const proportionsForHour = taskHours.flatMap(task =>
      task.proportions[hour] ? { taskID: task.taskID, proportion: task.proportions[hour], directions: task.directions[hour] } : []
    );

    const fetchTaskName = (taskID) => {
      const task = tasks.find(task => task.taskID === taskID);
      return task ? task.taskName : '';
    };

    const fetchTaskColour = (taskID) => {
      const task = tasks.find(task => task.taskID === taskID);
      return task ? task.taskColor : '#32CD32';
    };

    const handleLongPress = (taskID) => {
      setShowTaskModal(false);
      setUpdateTask(tasks.find(task => task.taskID === taskID));
      setShowUpdateTaskModal(true);
    };

    const handleHourLongPress = () => {
        setShowTaskModal(true);
      
    }

    const numTasks = proportionsForHour.length;

    return (
      <TouchableOpacity onLongPress={() => handleHourLongPress()} delayLongPress={500}>
        <View style={styles.hourRow}>
          <Text style={styles.hourText}>{`${hour}:00`}</Text>
          <View style={styles.proportionContainer}>
            {proportionsForHour.map(({ taskID, proportion, directions }) => {
              const boxStyle = getBoxStyle(proportion, directions, numTasks);
              const taskBackgroundColour = fetchTaskColour(taskID);
              return (
                <TouchableOpacity
                  key={taskID}
                  style={[styles.proportionBox, { backgroundColor: taskBackgroundColour || 'green' }, boxStyle]}
                  onLongPress={() => handleLongPress(taskID)} 
                >
                  <Text style={styles.proportionText}>
                    {fetchTaskName(taskID)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {selectedDate && (
        <View style={styles.dateHeader}>
          <View style={styles.selectedDateViewContainer}>
            <Text style={styles.selectedDateText}>Date selected: {moment(selectedDate).format('LL')}</Text>
          </View>
          <IconButton
            icon="help-circle-outline"
            size={24}
            mode="contained"
            onPress={showHelp}
            style={styles.helpButton}
          />
          <Modal
            visible={helpVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={hideHelp}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How to use calendar ?</Text>
                <Text style={styles.modalText}>
                  1. Access task form with "+ Task" button in header or quickly access "Task form" by long pressing on hours.
                </Text>
                <Text style={styles.modalText}>
                  2. Enter Task name, and select time and project.
                </Text>
                <Text style={styles.modalText}>
                  3. Not entering End date will create the task indefinitely.
                </Text>
                <Text style={styles.modalText}>
                  4. Not selecting project will allow you to create a personal task. (i.e Gym, hangout, etc.)
                </Text>
                <Text style={styles.modalText}>
                  5. Record your expenses by entering expense amount, expense description, adding receipt. (Optional)
                </Text>
                <Text style={styles.modalText}>6. Use "Submit" button to create task.</Text>
                <Text style={styles.modalText}>7. Long press on any task to view or edit details.</Text>
                <Button mode="contained" onPress={hideHelp}>OK</Button>
              </View>
            </View>
          </Modal>
        </View>
      )}
      <ScrollView
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateBannerContainer}
      >
        {dates.map(date => (
          <TouchableOpacity key={date.format('YYYY-MM-DD')} onPress={() => setSelectedDate(date.format('YYYY-MM-DD'))}>
            <View style={[styles.dateContainer, selectedDate === date.format('YYYY-MM-DD') && styles.selectedDateContainer]}>
              <Text style={styles.dateText}>{date.format('DD')}</Text>
              <Text style={styles.dayText}>{date.format('ddd')}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {calendarState && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => onChange(event, date)}
        />
      )}
      <ScrollView 
        vertical
        style={styles.hourContainer} 
        showsVerticalScrollIndicator={true}
      >
        {hours.map(hour => renderHourCell(hour))}
      </ScrollView>
    </View>
  );
};

/**
 * Prop type definition
 */
CalendarGrid.propTypes = {
  calendarState: PropTypes.shape({
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
  }).isRequired,
  setCalendarState: PropTypes.func.isRequired,
  setCalendarColour: PropTypes.func.isRequired,
  setShowTaskModal: PropTypes.func.isRequired,
  setReturnDateTime: PropTypes.func.isRequired,
  setShowUpdateTaskModal: PropTypes.func.isRequired,
  setUpdateTask: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  dateBannerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dateContainer: {
    width: 40, 
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedDateContainer: {
    backgroundColor: '#7dc7f6',
    borderRadius: 10,
  },
  dateText: {
    fontSize: FontPreferences.sizes.medium,
    color: '#000',
  },
  dayText: {
    fontSize: FontPreferences.sizes.small,
    color: 'rgb(5, 5, 5)',
  },
  hourContainer: {
    marginTop: 10,
    flexGrow: 1, 
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    height: 50,
  },
  hourText: {
    fontSize: FontPreferences.sizes.medium,
    color: '#000',
    marginLeft: 5,
    width: 60,
  },
  proportionContainer: {
    flexDirection: 'row', 
    flex: 1,
  },
  proportionBox: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  proportionText: {
    fontSize: FontPreferences.sizes.small,
    color: '#fff',
    textAlign: 'center',
  },
  selectedDateText: {
    fontSize: FontPreferences.sizes.medium,
    color: '#000',
    textAlign: 'center',
  },
  selectedDateViewContainer: {
    backgroundColor: '#7dc7f6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  helpButton: {
    position: 'absolute',
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: width * 0.8,
    maxHeight: height * 0.7, 
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
});

export default CalendarGrid;

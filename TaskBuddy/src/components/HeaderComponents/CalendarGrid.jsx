import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import moment from 'moment';
import { FontPreferences } from '../../utility/FontPreferences';  
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchTasks, getTaskHoursForDay } from '../../FireBaseInteractionQueries/manageTasks'; 
import { setupUserProfileListener } from '../../FireBaseInteractionQueries/userProfile';


const CalendarGrid = ({ calendarState, setCalendarState, calendarColour, setCalendarColour, setShowTaskModal, setReturnDateTime }) => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [tasks, setTasks] = useState([]);
  const [taskHours, setTaskHours] = useState([]);
  const [triggerPoint, setTriggerPoint] = useState(0);
  const hourScrollViewRef = useRef(null);  
  const scrollViewRef = useRef(null);

  useEffect(() => {

    const getTasksForDate = async (date) => {
      try {
        const tasksForDay = await fetchTasks(date);
        const tasksWithDisplayDetails = await Promise.all(tasksForDay.map(async (task) => {
          const taskDisplayDetails = await getTaskHoursForDay(task.repStartDateTime, task.repEndDateTime, date);
          return { ...task, ...taskDisplayDetails };
        }));
        setTasks(tasksWithDisplayDetails);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    getTasksForDate(selectedDate);
  }, [selectedDate, triggerPoint]);

  useEffect(() => {
    const calcTaskHourProportions = async () => {
      const tasksPromise = await Promise.all(
        tasks.map(async (task) => {
          const {taskID, proportions, directions} = await calculateHourlyProportions(task.repStartDateTime, task.repEndDateTime, task.taskID);
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

  const calculateHourlyProportions = async (startTimestamp, endTimestamp, taskID) => {
    const start = moment(startTimestamp);
    const end = moment(endTimestamp);

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      throw new Error('Invalid timestamps');
    }

    const proportions = {};
    const directions = {}; 

    let currentHour = start.clone().startOf('hour');
    const endHour = end.clone().startOf('hour');

    while (currentHour <= endHour) {
      const hourStart = currentHour.clone();
      const hourEnd = currentHour.clone().endOf('hour');

      let proportion = 0;
      let direction = '';

      if (start.isSameOrBefore(hourStart) && end.isSameOrAfter(hourEnd)) {
        proportion = 1;
        direction = 'full'; 
      } else if (start.isSameOrAfter(hourStart) && end.isSameOrBefore(hourEnd)) {
        const minutes = end.diff(start, 'minutes');
        proportion = minutes / 60;
        direction = 'middle';     
      } else if (start.isBetween(hourStart, hourEnd, null, '[)')) {
        const minutes = hourEnd.diff(start, 'minutes');
        proportion = minutes / 60;
        direction = 'end'; 
      } else if (end.isBetween(hourStart, hourEnd, null, '(]')) {
        const minutes = end.diff(hourStart, 'minutes');
        proportion = minutes / 60;
        direction = 'start';
      }

      if (proportion > 0 && proportion <= 0.25) {
        proportion = 0.25;
      } else if (proportion > 0.25 && proportion <= 0.5) {
        proportion = 0.5;
      } else if (proportion > 0.5 && proportion <= 0.75) {
        proportion = 0.75;
      } else if (proportion > 0.75 && proportion <= 1) {
        proportion = 1;
      }

      proportions[currentHour.format('H')] = proportion;
      directions[currentHour.format('H')] = direction; 

      currentHour.add(1, 'hour');
    }

    return { taskID, proportions, directions };
  };

  const onChange = (event, date) => {
    if (date) {
      setCalendarState(false);
      setSelectedDate(moment(date).format('YYYY-MM-DD'));
    }
  };

  useEffect(() => {
    if (!calendarState) {
      setCalendarColour('#D3D3D3');
    } 
  }, [calendarState]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

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

  const numDays = 15; // Number of days before and after today to show in the banner
  const dates = getDates(numDays);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: (numDays * 38), animated: true });
    }
  }, [numDays]);

  useEffect(() => {
    if (hourScrollViewRef.current) {
      const currentHour = moment().hour();
      hourScrollViewRef.current.scrollTo({
        y: currentHour * 50,
        animated: true
      });
    }
  }, []);

  const getBoxStyle = (proportion, direction, numTasks) => {
    const boxHeight = 49 * proportion; 
    const boxWidth = `${100 / numTasks}%`; 

    let marginTop = 0;
    let marginBottom = 0;
    let marginVertical = 0;
    let returnStyle = { width: boxWidth }; 

    if (direction === 'end') {
      marginTop = 50 * (1 - proportion);
      returnStyle = { ...returnStyle, height: boxHeight, marginTop: marginTop };
    } else if (direction === 'middle') {
      marginVertical = (50 - boxHeight) / 2; 
      returnStyle = { ...returnStyle, height: boxHeight, marginVertical: marginVertical };
    } else if (direction === 'start') {
      marginBottom = 50 * (1 - proportion); 
      returnStyle = { ...returnStyle, height: boxHeight, marginBottom: marginBottom };
    }

    return returnStyle;
  };

  const renderHourCell = (hour) => {
    const proportionsForHour = taskHours.flatMap(task =>
      task.proportions[hour] ? { taskID: task.taskID, proportion: task.proportions[hour], directions: task.directions[hour] } : []
    );

    const fetchTaskName = (taskID) => {
      const task = tasks.find(task => task.taskID === taskID);
      return task ? task.taskName : '';
    }

    const handleLongPress = () => {
      const dateTime = `${selectedDate} ${hour}:00:00`;
      setReturnDateTime(dateTime);
      setShowTaskModal(true);
    };

    const numTasks = proportionsForHour.length;

    return (
      <TouchableOpacity onLongPress={handleLongPress} delayLongPress={500}>
        <View style={styles.hourRow}>
          <Text style={styles.hourText}>{`${hour}:00`}</Text>
          <View style={styles.proportionContainer}>
            {proportionsForHour.map(({ taskID, proportion, directions }) => {
              const boxStyle = getBoxStyle(proportion, directions, numTasks);
              return (
                <TouchableOpacity
                  key={taskID}
                  style={[styles.proportionBox, boxStyle]}
                >
                  <Text style={styles.proportionText} numberOfLines={1} ellipsizeMode="tail">
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
        <View style={styles.selectedDateViewContainer}>
          <Text style={styles.selectedDateText}>Date selected: {moment(selectedDate).format('LL')}</Text>
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
        ref={hourScrollViewRef}
      >
        {hours.map(hour => renderHourCell(hour))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
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
    backgroundColor: '#32CD32',
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
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: 'center',
  },
});

export default CalendarGrid;

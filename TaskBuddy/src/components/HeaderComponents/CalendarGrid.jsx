import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { FontPreferences } from '../../utility/FontPreferences';  
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';


const CalendarGrid = ({calendarState, setCalendarState, calendarColour, setCalendarColour}) => {

const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

const onChange = (event, selectedDate) => {
  if(selectedDate)
  {
    setCalendarState(false);
    setSelectedDate(moment(selectedDate).format('YYYY-MM-DD'));
  }
};

useEffect(() => {
  if (!calendarState) {
    setCalendarColour('#D3D3D3');
  } 
}, [calendarState]);

// Generate hours from 0 to 23
const hours = [];

for (let i = 0; i < 24; i++) {
  hours.push(i);
}

// Get dates array for the banner
const getDates = (numDays) => {
  let today ;
  if(selectedDate === null) {
  today = moment();
  } else if(selectedDate !== null) {
    today = moment(selectedDate);
  }
  const dates = [];
  for (let i = -numDays; i <= numDays; i++) {
    dates.push(today.clone().add(i, 'days'));
  }
  return dates;
};

  /**When this grid is in focus, update selectedDate to selectedDate. */
  useFocusEffect(
    useCallback(() => {
      setSelectedDate(moment(selectedDate).format('YYYY-MM-DD'));
    }, [])
  );

  /**Get todays date and dates for banner */
  const numDays = 15; // Number of days before and after today to show in the banner
  const dates = getDates(numDays);

  const scrollViewRef = useRef(null);

  /**move scrollview to current date */
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: (numDays * 38) , animated: true });
    }, 0);
  }, []);


  const renderHourCell = (hour) => (
    <TouchableOpacity >
      <View key={hour} style={styles.hourRow}>
        <Text style={styles.hourText}>{`${hour}:00`}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {
        selectedDate && (
          <View style={styles.selectedDateViewContainer}>
            <Text style={styles.selectedDateText}>Date selected: { moment(selectedDate).format('LL') }</Text>
          </View>        
        )
      }
      {   <ScrollView
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
        }  
        {
          calendarState && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {onChange(event, selectedDate)}}
            />
          )
        }
      <ScrollView style={styles.hourContainer} showsVerticalScrollIndicator = {false}>
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
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  hourText: {
    fontSize: FontPreferences.sizes.medium,
    color: '#000',
    marginLeft: 5,
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

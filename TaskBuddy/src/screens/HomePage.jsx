import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import Header from "../components/Header.jsx";
import CalendarGrid from "../components/HeaderComponents/CalendarGrid.jsx";
import TaskFormModal from "../components/TaskForm.jsx";

const HomePage = ({ navigation }) => {

  const [calendarState, setCalendarState] = useState(false);
  const [calendarColour, setCalendarColour] = useState('#D3D3D3');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [returnDateTime, setReturnDateTime] = useState();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Header 
          navigation={navigation} 
          screenName={'HomePage'} 
          calendarState={calendarState} 
          setCalendarState={setCalendarState} 
          setCalendarColour={setCalendarColour} 
          calendarColour={calendarColour} 
          setShowTaskModal={setShowTaskModal}
        />
        <CalendarGrid 
          calendarState={calendarState} 
          setCalendarState={setCalendarState} 
          calendarColour={calendarColour} 
          setCalendarColour={setCalendarColour} 
          setShowTaskModal={setShowTaskModal}
          setReturnDateTime={setReturnDateTime}
        />
        { showTaskModal &&
        <TaskFormModal 
          navigation={navigation} 
          isVisible={showTaskModal} 
          onClose={() => setShowTaskModal(false)}
          returnDateTime={returnDateTime}
        />
    }
      </View>
    </SafeAreaView>
  );
};

export default HomePage;

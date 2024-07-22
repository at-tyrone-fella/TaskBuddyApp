import React from "react";
import { View, SafeAreaView } from "react-native";
import Header from "../components/Header.jsx";
import CalendarGrid from "../components/HeaderComponents/CalendarGrid.jsx";

const HomePage = ({ navigation }) => {

  const[calendarState, setCalendarState] = React.useState(false);
  const[calendarColour, setCalendarColour] = React.useState('#D3D3D3');

  return (
    <SafeAreaView>
      <View>
        <Header navigation={navigation} screenName={'HomePage'} calendarState={calendarState} setCalendarState={setCalendarState} setCalendarColour={setCalendarColour} calendarColour={calendarColour}/>
        <CalendarGrid calendarState={calendarState} setCalendarState={setCalendarState} calendarColour={calendarColour} setCalendarColour={setCalendarColour}/>
      </View>
    </SafeAreaView>
  );
};


export default HomePage;
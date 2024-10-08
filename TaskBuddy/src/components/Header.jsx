import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Logo from './HeaderComponents/Logo';
import UserProfile from './HeaderComponents/UserProfile';
import CreateTask from './HeaderComponents/CreateTask';
import { width, height } from '../utility/DimensionsUtility';
import { Button } from 'react-native-paper';
import PropTypes from 'prop-types';

const Header = ({ navigation, screenName, calendarState, setCalendarState, calendarColour, setCalendarColour, setShowTaskModal }) => {

  const changeCalendarState = async () => {
    await setCalendarState(true);
  }

  useEffect(() => {
    if (calendarState) {
      setCalendarColour('#ffc300');
    }
  }, [calendarState]);

  /*
  Added prop types for Header
  */
  Header.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func,
  }).isRequired,
  screenName: PropTypes.string.isRequired,
  calendarState: PropTypes.shape({
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
  }).isRequired,
  setCalendarState: PropTypes.func.isRequired,
  calendarColour: PropTypes.string.isRequired,
  setCalendarColour: PropTypes.func.isRequired,
  setShowTaskModal: PropTypes.func.isRequired,
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomePage')}>
          <Logo />
        </TouchableOpacity>
        <View style={styles.spacer} /> 
        <UserProfile />
        <View style={styles.spacer} /> 
        {screenName === 'HomePage' && (
          <View style = {styles.calendar}>
            <Button icon="calendar" labelStyle={{fontSize:35,color:`${calendarColour}`}} onPress={() => 
              changeCalendarState()
            }
               ></Button>
          </View>
        )}
        <View style={styles.spacer} /> 
        <View style={styles.create}>
          <CreateTask navigation={navigation} setShowTaskModal={setShowTaskModal}/>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181F6F',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  create: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  calendar: {
    marginLeft : 150,
    marginTop : 10,
  }
});

export default Header;

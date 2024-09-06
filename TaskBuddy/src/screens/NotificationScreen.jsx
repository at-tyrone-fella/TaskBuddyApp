import React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import Header from "../components/Header.jsx";
import { height } from "../utility/DimensionsUtility.js";
import Notification from '../components/Notification.jsx';
import PropTypes from 'prop-types';

const NotificationScreen = ({ navigation }) => {

  /**
   * Added PropTypes for navigation
   */
  NotificationScreen.propTypes = {
    navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    }).isRequired,
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.innerContainer}>
          <View style={styles.createClientContainer}>
            <Notification/>
          </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  clientText: {
    fontSize: 16,
    padding: 10,
    textAlign: 'center',
  },
  clientContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sideContainer: {
    width: '40%',
    height: height,
    backgroundColor: 'lightblue',
  },
  sideTitle: {
    fontSize: 20,
    padding: 10,
    textAlign: 'center',
  },
  createClientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;

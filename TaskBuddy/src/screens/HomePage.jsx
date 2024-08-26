import React, { useEffect, useState } from "react";
import { SafeAreaView, Modal, View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native";
import Header from "../components/Header.jsx";
import CalendarGrid from "../components/HeaderComponents/CalendarGrid.jsx";
import TaskFormModal from "../components/TaskForm.jsx";
import UpdateTaskFormCard from "../components/UpdateTaskForm.jsx";
import { getUserProfiles } from "../FireBaseInteraction/userProfile.js";
import PropTypes from 'prop-types';
import { Button } from 'react-native-paper'; 

const { width, height } = Dimensions.get('window');

const HomePage = ({ navigation }) => {  
  const [calendarState, setCalendarState] = useState(false);
  const [calendarColour, setCalendarColour] = useState('#D3D3D3');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [updateTask, setUpdateTask] = useState();
  const [returnDateTime, setReturnDateTime] = useState();
  const [showUserProfileAlert, setShowUserProfileAlert] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      await getUserProfiles((data) => {
        console.log(('username' in data))
      if (data.username === '' || !('username' in data)) {
        displayUserProfileAlert();
      }
      });
    };
    fetchUserProfile();
  }, []);

  const displayUserProfileAlert = () => {
    setShowUserProfileAlert(true);
  };

  const hideUserProfileAlert = () => {
    setShowUserProfileAlert(false);
  };

  HomePage.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        setShowUpdateTaskModal={setShowUpdateTaskModal}
        setUpdateTask={setUpdateTask}
      />
      {showTaskModal && (
        <TaskFormModal
          navigation={navigation} 
          isVisible={showTaskModal} 
          onClose={() => setShowTaskModal(false)}
          returnDateTime={returnDateTime}
        />
      )}
      {showUpdateTaskModal && (
        <UpdateTaskFormCard 
          task={updateTask}
          isVisible={showUpdateTaskModal} 
          onClose={() => setShowUpdateTaskModal(false)}
        />
      )}
      {showUserProfileAlert && (
        <Modal
          visible={showUserProfileAlert}
          transparent={true}
          animationType="slide"
          onRequestClose={hideUserProfileAlert}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>User Profile Inomplete !!</Text>
              <Text style={styles.modalText}>
                To use this application effectively, please choose a unique user name.
                Go to <TouchableOpacity onPress={() => {navigation.navigate('UserProfile')}}><Text style={{color:'blue'}}>"My Profile"</Text></TouchableOpacity> section and edit your profile to add a username.
              </Text>
              <Button mode="contained" onPress={hideUserProfileAlert}>OK</Button>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});

export default HomePage;

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const CreateTask = ({ setShowTaskModal }) => {

 const handleTaskModal = () => {
    setShowTaskModal(true);
 }  

 CreateTask.propTypes = {
  setShowTaskModal: PropTypes.func,
};

  return (
    <TouchableOpacity style={styles.button} onPress={handleTaskModal}>
      <Text style={styles.buttonText}>+ Task</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'yellow',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 18,
  },
});

export default CreateTask;

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CreateTask = ({ setShowTaskModal }) => {

 const handleTaskModal = () => {
    setShowTaskModal(true);
 }  

  return (
    <TouchableOpacity style={styles.button} onPress={handleTaskModal}>
      <Text style={styles.buttonText}>+ Task</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'yellow',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default CreateTask;

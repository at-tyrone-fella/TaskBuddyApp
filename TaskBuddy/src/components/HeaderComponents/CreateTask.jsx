import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

const CreateTask = () => {

  return (
    <TouchableOpacity
      style={[styles.buttonContainer, { backgroundColor: '#ffc300' }]}
      onPress={() => {}}
    >
      <Text style={styles.buttonText}>New Task</Text>
    </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20, 
    paddingHorizontal: 10, 
    borderRadius: 5,
    width: 90,
    height: 30,
    alignItems: 'center',
  },
    buttonText: {
    color: 'rgb(0, 0, 0)', 
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
 },
});

export default CreateTask;

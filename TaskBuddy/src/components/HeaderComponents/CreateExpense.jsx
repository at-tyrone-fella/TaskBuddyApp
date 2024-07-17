import React from 'react';
import {View,Text, StyleSheet} from 'react-native';

const CreateExpense = () => {
  return (
        <View style={styles.create}>
          <Text >+ Create Expense</Text>
        </View>
    );
};

const styles = StyleSheet.create({
  create: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  }
});

export default CreateExpense;

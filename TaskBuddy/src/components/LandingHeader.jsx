import React from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import Logo from './HeaderComponents/Logo';
import { height, width } from '../utility/DimensionsUtility';
import { FontPreferences } from '../utility/FontPreferences';

const LandingHeader = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => {navigation.navigate('Landing')}}>
        <Logo />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={() => {navigation.navigate('ScrollSignUp')}}
      >
        <Text style={styles.buttonText}>Sign Up/Log In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181F6F',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.0125,
    paddingHorizontal: width * 0.03,
  },
  buttonContainer: {
    backgroundColor: '#ffc300',
    borderRadius: 5,
    paddingVertical: height * 0.010,
    paddingHorizontal: width * 0.02,
  },
  buttonText: {
    color: '#000000',
    fontSize: FontPreferences.sizes.medium,
  },
});

export default LandingHeader;

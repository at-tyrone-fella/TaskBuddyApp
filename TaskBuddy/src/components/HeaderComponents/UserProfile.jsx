import React from 'react';
import {View,Text, StyleSheet} from 'react-native';
import { FontPreferences } from '../../utility/FontPreferences';

const UserProfile = () => {
  return (
        <View style={styles.profile}>
          <Text style={styles.text} >User Name</Text>
          <Text style={styles.text}>Role</Text>
        </View>  );
};

const styles = StyleSheet.create({
  profile: {
    position: 'absolute',
    left: '40%',
  },
  text:{
    fontSize: FontPreferences.sizes.small,
    color: 'rgb(251, 250, 250)',
  }
});

export default UserProfile;

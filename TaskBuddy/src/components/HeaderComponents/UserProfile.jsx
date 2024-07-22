import React, { useEffect, useState } from 'react';
import {View,Text, StyleSheet} from 'react-native';
import { FontPreferences } from '../../utility/FontPreferences';
import { getUserName } from '../../FireBaseInteractionQueries/userProfile';

const UserProfile = () => {

 const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const unsubscribe = await getUserName(name => {
        setUserName(name ? name.substring(0, 5) : '');
      });
      return unsubscribe;

    } catch (error) {
      console.log('Error fetching user name: ', error);
    }
  };
    fetchUserName();
  }, []);


  return (
        <View style={styles.profile}>
          <Text style={styles.text} > Welcome! </Text>
          { userName ? 
            <Text style={styles.text} >  { userName }... </Text>
          : <Text style={styles.text}></Text>
          }
        </View>  );
};

const styles = StyleSheet.create({
  profile: {
    position: 'absolute',
    left: '30%',
  },
  text:{
    fontSize: FontPreferences.sizes.medium,
    color: '#f9faf6',
  }
});

export default UserProfile;

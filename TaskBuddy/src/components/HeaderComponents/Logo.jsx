import React from 'react';
import {Image, StyleSheet} from 'react-native';

const Logo = () => {
  return (
        <Image source={require('../../assets/Logo.png')} style={styles.logo}/>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  }
});

export default Logo;

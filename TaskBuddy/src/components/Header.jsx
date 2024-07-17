import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Logo from './HeaderComponents/Logo';
import UserProfile from './HeaderComponents/UserProfile';
import CreateTask from './HeaderComponents/CreateTask';
import CreateExpense from './HeaderComponents/CreateExpense';
import { width, height } from '../utility/DimensionsUtility';

const Header = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo />
        <UserProfile />
        <View style={styles.create}>
          <CreateTask />
          <CreateExpense />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181F6F',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  create: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'rgb(247, 243, 243)',
  }
});

export default Header;

import React, { useRef, useState } from 'react';
import { DrawerLayoutAndroid, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontPreferences } from '../utility/FontPreferences.js';
import { height, width } from '../utility/DimensionsUtility.js';
import { useAuth } from '../auth/AuthContext.js';

const Drawer = ({ navigation }) => {
  const drawer = useRef(null);
  const [drawerPosition, setDrawerPosition] = useState('left');

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.navigate('Landing');
  };

  const navigationView = () => (
    <View style={styles.navigationContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Menu</Text>
      </View>
      <View style={styles.drawerItemContainer}>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>Reports / Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Organization</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Clients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Profile</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
        <Text style={styles.drawerItemText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition={drawerPosition}
      renderNavigationView={navigationView}
    >
      <View style={styles.navigationContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Menu</Text>
      </View>
      <View style={styles.drawerItemContainer}>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>Reports / Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Organization</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Clients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('')}>
          <Text style={styles.drawerItemText}>My Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('UserProfile')}>
          <Text style={styles.drawerItemText}>My Profile</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
        <Text style={styles.drawerItemText}>Logout</Text>
      </TouchableOpacity>
    </View>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  navigationContainer: {
    flex: 1,
    backgroundColor: '#181F6F',
    paddingTop: 50,
  },
  drawerHeader: {
    height: height * 0.125,
    backgroundColor: '#181F6F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerHeaderText: {
    color: '#fff',
    fontSize: FontPreferences.sizes.large,
    fontWeight: 'bold',
  },
  drawerItemContainer: {
    flex: 1,
    paddingVertical: height * 0.015,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderTopColor: '#ccc',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  drawerItemText: {
    fontSize: FontPreferences.sizes.medium,
    marginLeft: 15,
    color: 'rgb(252, 250, 250)',
  },
});

export default Drawer;

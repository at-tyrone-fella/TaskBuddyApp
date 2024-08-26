import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../../firebaseConfig.js';
import PropTypes from 'prop-types';

const AuthenticationContext = createContext();

export const AuthProvider = ({ children }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState(null);


  /**
   * This method checks for refreshToken and signsIn if the refresh token is found.
   * If refresh token is not available, it will clear expo-secure-store fields and intiates logout procedure.
   * This useEffect() will allow checkToken method to be called only once upon component mount.
   */
  useEffect(() => {
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userID = await SecureStore.getItemAsync('userID');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (token && refreshToken) {
        try {
          await auth().signInWithCustomToken(refreshToken);
          setIsAuthenticated(true);
          setUserID(userID);
        } catch (e) {
          console.error(e);
          setIsAuthenticated(false);
          setUserID(null);
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUserID(null);
        logout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  checkToken();
}, []);


/**
 * This method sets expo secure store fields such as userToken, refreshToken and userID. 
 * Managing them at secure store allows secure and instant access to these fields without passing them around in the applicaiton.
 * @param  user 
 */
const login = async (user) => {
    try {
      await SecureStore.setItemAsync('userToken', user.token);
      await SecureStore.setItemAsync('refreshToken', user.refreshToken);
      await SecureStore.setItemAsync('userID', user.userId);
      setIsAuthenticated(true);
      setUserID(user.userId);
    } catch (e) {
      console.error(e);
    }
  };

/**
 * This method will delete user credentials from secure store and will setIsAuthenticated to false and userID to null.
 */
const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userID');
      setIsAuthenticated(false);
      setUserID(null);
    } catch (e) {
      console.error(e);
    }
  };

  //PropTypes added for AuthProvider
  AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
  
  return (
    <AuthenticationContext.Provider value={{ isAuthenticated, userID, login, logout }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuth = () => useContext(AuthenticationContext);
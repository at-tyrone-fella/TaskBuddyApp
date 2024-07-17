import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../../firebaseConfig.js';

const AuthenticationContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState(null);

  useEffect(() => {
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userID = await SecureStore.getItemAsync('userID');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      /**
       * IF the tokens exist, try to login with it.
       */
      if (token && refreshToken) {
        try {
          await auth().signInWithCustomToken(refreshToken);
          setIsAuthenticated(true);
          setUserID(userID);
        } catch (e) {
          console.error(e);
          setIsAuthenticated(false);
          setUserID(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserID(null);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  checkToken();
}, []);

  const login = async (user) => {
    try {
      await SecureStore.setItemAsync('userToken', user.token);
      await SecureStore.setItemAsync('refreshToken', user.refreshToken);
      await SecureStore.setItemAsync('userID', user.userId);
      setIsAuthenticated(true);
      setUserID(user.userId);
    //  console.log('User logged in:', user);
    //  console.log('token ID:', await SecureStore.getItemAsync('userToken')  );
    //  console.log('refresh token:', await SecureStore.getItemAsync('refreshToken')  );
    } catch (e) {
      console.error(e);
    }
  };


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
  
  return (
    <AuthenticationContext.Provider value={{ isAuthenticated, userID, login, logout, loading }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuth = () => useContext(AuthenticationContext);
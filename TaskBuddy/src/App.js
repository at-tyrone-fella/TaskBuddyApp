import React, { useEffect } from 'react';
import Wrapper from './Wrapper.js';
import { AuthProvider, useAuth } from './auth/AuthContext.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Drawer from './components/Drawer.jsx';
import { ScrollWrappedLanding, ScrollWrappedSignInForm, ScrollWrappedSignUp, ScrollWrappedSignInScreen, ScrollWrappedHomePage, ScrollWrappedUserProfile } from './utility/wrappedScrollViewScreen.js';
import { View, ActivityIndicator } from 'react-native';
import { registerBackgroundFetchTask, unregisterBackgroundFetchTask } from './utility/backgroundTokenRefresh.js';

const Stack = createNativeStackNavigator();
const DrawerStack = createDrawerNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Landing'>
      <Stack.Screen name="Landing" component={ScrollWrappedLanding} options={{ headerShown: false }} />
      <Stack.Screen name="ScrollSignUp" component={ScrollWrappedSignUp} options={{ headerShown: false }} />
      <Stack.Screen name="ScrollSignIn" component={ScrollWrappedSignInForm} options={{ headerShown: false }} />
      <Stack.Screen name="ScrollSignInScreen" component={ScrollWrappedSignInScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <DrawerStack.Navigator drawerContent={(props) => <Drawer {...props} />}>
      <DrawerStack.Screen name="HomePage" component={ScrollWrappedHomePage} options={{ headerShown: false }}/>
      <DrawerStack.Screen name="SignUp" component={ScrollWrappedSignUp} options={{ headerShown: false }} />
      <DrawerStack.Screen name="UserProfile" component={ScrollWrappedUserProfile} options={{ headerShown: false }} />
    </DrawerStack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <DrawerNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

export default function App() {

  useEffect(() => {
    const initializeApp = async () => {
      await registerBackgroundFetchTask();
    };

    initializeApp();

    return () => {
      unregisterBackgroundFetchTask();
    };
  },[]);

  return (
    <AuthProvider>
    <Wrapper>
        <AppNavigator />
    </Wrapper>
    </AuthProvider>
  );
}

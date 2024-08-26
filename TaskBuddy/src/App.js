import React, { useEffect } from 'react';
import Wrapper from './Wrapper.js';
import { AuthProvider, useAuth } from './auth/AuthContext.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SignInForm from './components/SignInForm.jsx';
import Drawer from './components/Drawer.jsx';
import { ScrollWrappedLanding, ScrollWrappedSignUp,
         ScrollWrappedSignInScreen, ScrollWrappedHomePage, ScrollWrappedUserProfile,
         ScrollWrappedOrganization, ScrollWrappedCreateClient, ScrollWrappedProject,
         ScrollWrappedNotification, ScrollWrappedReports } from './utility/wrappedScrollViewScreen.js';
import { registerBackgroundFetchTask, unregisterBackgroundFetchTask } from './utility/backgroundTokenRefresh.js';

/**
 * Stack navigator for authentication screens and drawer navigator to navigate between different sections after successful login.
 */
const Stack = createNativeStackNavigator();
const DrawerStack = createDrawerNavigator();

/**
 * This is authentication Stack Navigator with initial Route as Landing
 * ScrollWrapped components used to enable top level scrolling.
 * @returns AuthStackNavigator
 */
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Landing'>
      <Stack.Screen name="Landing" component={ScrollWrappedLanding} options={{ headerShown: false }} />
      <Stack.Screen name="ScrollSignUp" component={ScrollWrappedSignUp} options={{ headerShown: false }} />
      <Stack.Screen name="ScrollSignIn" component={SignInForm} options={{ headerShown: false }} />
      <Stack.Screen name="ScrollSignInScreen" component={ScrollWrappedSignInScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

/**
 * This component returns custom DrawerStackNavigator .
 * @returns 
 */
const DrawerNavigator = () => {
  return (
    <DrawerStack.Navigator drawerContent={(props) => <Drawer {...props} />}>
      <DrawerStack.Screen name="HomePage" component={ScrollWrappedHomePage} options={{ headerShown: false }}/>
      <DrawerStack.Screen name="SignUp" component={ScrollWrappedSignUp} options={{ headerShown: false }} />
      <DrawerStack.Screen name="UserProfile" component={ScrollWrappedUserProfile} options={{ headerShown: false }} />
      <DrawerStack.Screen name="Organization" component={ScrollWrappedOrganization} options={{ headerShown: false }} />
      <DrawerStack.Screen name="CreateClient" component={ScrollWrappedCreateClient} options={{ headerShown: false }} />
      <DrawerStack.Screen name="Projects" component={ScrollWrappedProject} options={{ headerShown: false }} />
      <DrawerStack.Screen name="Reports" component={ScrollWrappedReports} options={{ headerShown: false }} />
      <DrawerStack.Screen name='Notification' component={ScrollWrappedNotification} options={{headerShown: false}} />
    </DrawerStack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      { isAuthenticated ? <DrawerNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

export default function App() {

  /**
   * This useEffect will registerBackground fetch task.
   */
  useEffect(() => {
    const initializeApp = async () => {
      console.log("initialize app")
      await registerBackgroundFetchTask();
    };

    initializeApp();

    return () => {
      unregisterBackgroundFetchTask();
    };
  },[]);


  /**
   * AuthProvider will passdown props such as isAuthenticated, Login , Logout throught the child componenets.
   */
  return (
    <AuthProvider>
      <Wrapper>
          <AppNavigator />
      </Wrapper>
    </AuthProvider>

  );
}

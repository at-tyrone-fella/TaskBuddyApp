import React, { useContext } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { AuthContext } from './auth/AuthContext';

const AppContent = () => {
  const { user, loading, signIn, logOut } = useContext(AuthContext);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View>
      {user ? (
        <>
          <Text>Welcome back, {user.email}!</Text>
          <Button title="Sign Out" onPress={logOut} />
        </>
      ) : (
        <>
          <Text>Please sign in</Text>
          <Button title="Sign In" onPress={() => Navigation.navigate('Scr')} />
        </>
      )}
    </View>
  );
};
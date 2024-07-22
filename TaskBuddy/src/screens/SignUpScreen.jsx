import {React, useState} from "react";
import { View, SafeAreaView, StyleSheet, TouchableWithoutFeedback } from "react-native";
import LandingHeader from "../components/LandingHeader.jsx";
import SignUpForm from "../components/SignUpForm.jsx";
import { Banner } from "react-native-paper";

const SignUpScreen = ({navigation}) => {
  const [visible, setVisible] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <LandingHeader navigation={navigation}/>
        <Banner
          visible={visible}
          actions={[
            {
              label: 'Hide',
              onPress: () => setVisible(false),
            },
            {
              label: 'Log In',
              onPress: () => {
                setVisible(true);
                navigation.navigate('ScrollSignInScreen');
              },
            },]}>
            Already have an account? Sign In to your account.
        </Banner>
        <TouchableWithoutFeedback>
          <View style={styles.centeredView}>
            <SignUpForm navigation={navigation}/>
          </View>
        </TouchableWithoutFeedback>        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  container: {
    flex: 1,
    },
  });

export default SignUpScreen;

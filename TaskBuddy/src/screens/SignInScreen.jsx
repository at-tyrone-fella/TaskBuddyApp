import { React, useEffect, useState } from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import LandingHeader from "../components/LandingHeader.jsx";
import SignInForm from "../components/SignInForm.jsx";
import { useRoute } from '@react-navigation/native';
import { Banner } from "react-native-paper";

/**Time to Hide Banner */
const secondsToHide = 60000;

const SignInScreen = ( {navigation } ) => {

  const [visibleBanner, setVisibleBanner] = useState(false);

  const route = useRoute(); 

  useEffect(() => {
    if(route.params?.userRegistered) {  
      setVisibleBanner(true);
      const timeToHideBanner = setTimeout(() => {
        setVisibleBanner(false);
      } , secondsToHide);
      return () => clearTimeout(timeToHideBanner);
    }
  }, [route.params?.userRegistered]);


  return (
    <SafeAreaView style={styles.container}>
      <View>
        <LandingHeader navigation={navigation}/>
        <Banner
          visible={visibleBanner}
          actions={[
            {
              label: 'Hide',
              onPress: () => setVisibleBanner(false),
            },
            ]}>
            Your account has been created successfully! Sign in to your account.
        </Banner>
        <View style={styles.centeredView}>
          <SignInForm navigation={navigation}/>
        </View>
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

export default SignInScreen;

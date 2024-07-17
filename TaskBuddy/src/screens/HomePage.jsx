import React from "react";
import { View, SafeAreaView, StyleSheet} from "react-native";
import Header from "../components/Header.jsx";
import { width, height } from "../utility/DimensionsUtility.js";
import { FontPreferences } from "../utility/FontPreferences.js";

const HomePage = ({ navigation }) => {

  return (
    <SafeAreaView>
      <View>
        <Header navigation={navigation} />
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
    backgroundColor: '#f8f8f8',
  },
  innerContainer: {
    padding: width * 0.05,
  },
  title: {
    fontFamily: FontPreferences.fontFamily,
    fontSize: FontPreferences.sizes.large,  
    fontWeight: 'bold',
    marginBottom: height * 0.0125,
    color: '#333', 
    padding: height * 0.0125,
  },
  description: {
    fontSize: FontPreferences.sizes.medium ,
    lineHeight: FontPreferences.lineHeights.medium,
    marginLeft: width * 0.025,
    marginRight: width * 0.025,
    marginBottom: height * 0.025,
    color: '#666', 
  },
  card: {
    marginHorizontal: width * 0.05,
    marginVertical: height * 0.025,
    marginVertical: height * 0.025,
    padding: width * 0.05,
  },
  feature: {
    fontSize: FontPreferences.sizes.medium,
    lineHeight: 24,
    textAlign: 'left',
    color: '#666',
    marginBottom: height * 0.01,
  },
  button: {
    backgroundColor: '#246EE9',
    width: 250,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: height * 0.01,
  },
});

export default HomePage;
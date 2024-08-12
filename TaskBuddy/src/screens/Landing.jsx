import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Button, Card, Paragraph } from "react-native-paper";
import LandingHeader from "../components/LandingHeader.jsx";
import SignInForm from "../components/SignInForm.jsx";
import { width, height } from "../utility/DimensionsUtility.js";
import { FontPreferences } from "../utility/FontPreferences.js";

const Landing = ({ navigation }) => {

  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView>
      <View>
        <LandingHeader navigation={navigation} />
        <Text style={styles.title}>Welcome to TaskBuddy !</Text>
        <Text style={styles.description}>Welcome to Taskbuddy, your ultimate companion for time and expense management designed exclusively for freelancers. </Text>
        <Text style={styles.description}>Whether you are juggling multiple projects, tracking billable hours, or managing expenses, we have got you covered.</Text>
        <Card style={styles.card}>
          <Card.Title title="Features" />
          <Card.Content>
            <Paragraph style={styles.feature}>- Time Tracking : You can add tasks and monitor them using a calendar view.</Paragraph>
            <Paragraph style={styles.feature}>- Budget Management : Easily monitor your budget allocation and any overruns.</Paragraph>
            <Paragraph style={styles.feature}>- Build Teams : Collaborate individually or in teams on projects, while easily tracking expenses and tasks.</Paragraph>
            <Paragraph style={styles.feature}>- Reporting & Analytics : Explore project information through reports and charts for clear visualization and understanding.</Paragraph>
            <Paragraph style={styles.feature}>- Reporting & Analytics : Explore project information through reports and charts for clear visualization and understanding.</Paragraph>
          </Card.Content>
        </Card>
        <Button mode="contained" buttonColor="" onPress={toggleModal} style={styles.button} >Log In / Sign Up</Button>
        {isModalVisible ?
        (
          <Modal transparent={true} animationType="fade" >
            <TouchableOpacity style={{backgroundColor: '#808080aa', flex:1,    justifyContent:'center'}} onPress={toggleModal}>
              <TouchableWithoutFeedback>
                <View>
                    <SignInForm navigation={navigation}/>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        ) : null} 
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

export default Landing;
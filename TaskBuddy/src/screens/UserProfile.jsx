import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, StyleSheet, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import Header from "../components/Header.jsx";
import { FontPreferences } from "../utility/FontPreferences.js";
import DateTimePicker from '@react-native-community/datetimepicker';
import CountryPicker from 'react-native-country-picker-modal';
import moment from 'moment-timezone';
import { Picker } from '@react-native-picker/picker';
import { fetchUserRecord } from '../auth/fetchUserRecord.js';
import { height, width } from "../utility/DimensionsUtility.js";
import { addUserProfile, getUserProfiles } from "../FireBaseInteractionQueries/userProfile.js";

const UserProfile = ({ navigation }) => {
  
  /**Fetch Email Id from current user auth state and prepopulate in form on rendering  */
  const  emailId  = fetchUserRecord();

  /**Declaring useStates to be used to maintain state of form */
  const [edit, setEdit] = useState(false); 
  const [country, setCountry] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [extension, setExtension] = useState('US');
  const [timezone, setTimezone] = useState('');
  const [address, setAddress] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('');
  const [email, setEmail] = useState(emailId);

  useEffect(() => {
    const fetchUserProfile = async () => {
      
      try{
        const unsubscribe = await getUserProfiles(
          (userProfile) => {
        if (userProfile) {
            setCountry(userProfile.country || '');
            setUsername(userProfile.username || '');
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            setGender(userProfile.gender || '');
            setDob(userProfile.dob ? new Date(userProfile.dob) : new Date());
            setContactNumber(userProfile.contactNumber || '');
            setExtension(userProfile.extension || 'US');
            setTimezone(userProfile.timezone || '');
            setAddress(userProfile.address || '');
            setPreferredCurrency(userProfile.preferredCurrency || '');
            setEmail(userProfile.email || emailId);
            }
          }
        );
        return unsubscribe;
      } catch (error) {
        console.log('Error fetching user profile: ', error);
      }
      
    };

    fetchUserProfile();
  }, []);

  const  onSubmit  = async () => {

    const dobISO = dob ? dob.toISOString() : null;

    const userProfileData = {
      country: country,
      username: username,
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      dob: dobISO, 
      contactNumber: contactNumber,
      extension: extension,
      timezone: timezone,
      address: address,
      preferredCurrency: preferredCurrency,
      email: email
    };

   // console.log('User Profile Data:', userProfileData);
    const submitUserProfile = await addUserProfile(userProfileData);
    if(submitUserProfile)
    {
      Alert.alert('Successfully updated !!', 'Your profile is now up to date.' ,[
                {
                    text: 'Ok',
                    onPress: () => {
                        navigation.navigate('HomePage');
                    }
                },
                {
                    text: 'View Profile',
                    onPress: () => {
                        setEdit(false);
                        navigation.navigate('UserPage');
                    }
                }
            ]);
    }
    else if(!submitUserProfile){
      Alert.alert('Update unsuccessful !!', 'Your profile cannot be updated at the moment.' ,[
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate('HomePage');
                    }
                }
            ]);
    }
  }

  /** All timezones are imported from moment module. */
  const allTimezones = moment.tz.names();

  const currencies = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'INR - Indian National Rupee', value: 'INR' },
  ];

  /**Set showDatePicker to true when launchDatePicker*/
  const launchDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
        <View style={styles.editContainer}>
          {!edit ? (
            <TouchableOpacity style={styles.editProfile} onPress={() => setEdit(true)}>
              <Text style={{color:'white'}}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.viewProfile} onPress={() => setEdit(false)}>
              <Text style={{color:'white'}}>View Profile</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.card}>
          <View style={{alignItems:'center',justifyContent:'centre'}}>
            <Text style={styles.cardTitle}>User Profile</Text>
          </View>
            <Text style={styles.legend}>Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={(value) => {setUsername(value);
              }}
              editable={edit}
            />
            <Text style={styles.legend}>Email *</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Email"
              value={email}
              editable={false}
            />
            <Text style={styles.legend}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={(value) => {setFirstName(value)}}
              editable={edit}
            />
            <Text style={styles.legend}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={(value) => {setLastName(value)}}
              editable={edit}
            />
            <Text style={styles.legend}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => {setGender(itemValue)}}
                enabled={edit}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Prefer Not to Say" value="Prefer not to say" />
              </Picker>
            </View>
            <Text style={styles.legend}>Date of Birth</Text>
            <View>
              <Button onPress={launchDatePicker} title="Select Date of Birth" color="#1877F2" disabled={!edit} />
              <Text>{dob.toDateString()}</Text>
              {showDatePicker && (
                <DateTimePicker
                  value={dob}
                  onChange={(event,selectedDate) => {
                    setShowDatePicker(false);
                    if(selectedDate)
                    {
                      setDob(selectedDate);
                    }  
                  }}
                />
              )}
            </View>
            <Text style={styles.legend}>Contact Number</Text>
            <View style={styles.row}>
            <View style={styles.extension}>
                { 
                  edit ? (
                      <CountryPicker
                      {...{
                        countryCode: extension ? extension.cca2 : 'US',
                        withFilter: true,
                        withFlag: true,
                        onSelect: (selectedCountry) => {
                          setExtension(selectedCountry);
                      }
                      }}
                    />
                  ) : (
                      <TextInput
                        style={[styles.contactNumber, styles.disabledInput]}
                        value={extension && extension.callingCode ? extension.callingCode[0] : ''}
                        editable={false}
                      />
                      )
                }
            </View>
            <TextInput
                style={styles.contactNumber}
                placeholder="Contact Number"
                value={contactNumber}
                keyboardType="phone-pad"
                onChangeText={(value) => setContactNumber(value)}
                editable={edit}
            />
          </View>
          <Text style={styles.legend}>Timezone</Text>
          <View style={styles.pickerContainer}>
          <Picker
            selectedValue={timezone}
            style={styles.picker}
            onValueChange={(itemValue) => setTimezone(itemValue)}
            enabled={edit}
          >
              {
                allTimezones.map((timeZone) => (
                    <Picker.Item key={timeZone} label={`${timeZone} (${moment.tz(timeZone).format('Z')})`} value={timeZone} />
                ))
              }
          </Picker>
            </View>
            <Text style={styles.legend}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={(value) => setAddress(value)}
              editable={edit}
            />
            <Text style={styles.legend}>Country *</Text>
            { edit ? (
              <CountryPicker
                {...{
                  countryCode: country ? country.cca2 : 'US',
                  withFilter: true,
                  withFlag: false,
                  withCountryNameButton: true,
                  onSelect: (selectedCountry) => setCountry(selectedCountry),
                }}
              />)
              : (
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={country ? country.name : 'Select Country'}
                editable={false}
              />
            )}           
            <Text style={styles.legend}>Preferred Currency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferredCurrency}
                style={styles.picker}
                onValueChange={(itemValue) => {setPreferredCurrency(itemValue)}}
                enabled={edit}
              >
                {currencies.map((currency, index) => (
                  <Picker.Item key={index} label={currency.label} value={currency.value} />
                ))}
              </Picker>
            </View>
          {edit && (
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={{color:'white'}}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  editContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: height * 0.025,
  },
  viewProfile: {
    backgroundColor: 'green',
    marginRight: 10,
    marginTop:5,
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  editProfile:{
    marginRight: 10,
    marginTop:5,
    backgroundColor: '#1877F2',
    padding: 10,
    borderRadius: 5
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: width * 0.05,
    elevation: 5,
    margin: width * 0.025,
  },
  cardTitle: {
    fontSize: FontPreferences.sizes.large,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legend: {
    fontWeight: 'bold',
    marginBottom: height * 0.005,
    marginTop: height * 0.01,
  },
  input: {
    height: height * 0.05,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: height * 0.02,
  },
  picker: {
    height: height * 0.05,
    marginTop : height * 0.01,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  extension: {
    marginRight: 10,
  },
  contactNumber: {
    flex: 1,
    height: height * 0.05,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: width * 0.02,
  },
  submitButton: {
    backgroundColor: 'green',
    padding: width*0.02,
    borderRadius: 50,
    marginTop: height*0.006,
    alignItems: 'center',
  },
});

export default UserProfile;

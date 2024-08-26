import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal as RNModal } from "react-native";
import { Button, IconButton } from 'react-native-paper';
import Header from "../components/Header.jsx";
import { FontPreferences } from "../utility/FontPreferences.js";
import DateTimePicker from '@react-native-community/datetimepicker';
import CountryPicker from 'react-native-country-picker-modal';
import moment from 'moment-timezone';
import { Picker } from '@react-native-picker/picker';
import { fetchUserRecord } from '../auth/fetchUserRecord.js';
import { height, width } from "../utility/DimensionsUtility.js";
import { addUserProfile, getUserProfiles } from "../FireBaseInteraction/userProfile.js";
import { checkUniqueUserName } from "../FireBaseInteraction/userProfile.js";
import PropTypes from 'prop-types';

const UserProfile = ({ navigation }) => {
  const emailId = fetchUserRecord();

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
  const [userNameError, setUserNameError] = useState('');
  const [address, setAddress] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('');
  const [email, setEmail] = useState(emailId);
  const [errorMessage, setErrorMessage] = useState('');
  const [isComponentMounted, setISComponentMounted] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');
  const [userProfileData, setUserProfileData] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [errorColour, setErrorColour] = useState('red');
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const unsubscribe = await getUserProfiles(
          (userProfile) => {
            if (userProfile) {
              setUserProfileData(userProfile);
              setCountry(userProfile.country || '');
              setUsername(userProfile.username || '');
              setExistingUserName(userProfile.username || '');
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

    fetchUserProfile().then(() => {
      setISComponentMounted(true);
    });
  }, []);

  const onSubmit = async () => {
    if (username !== '' && email !== '' && firstName !== '') {
      setErrorMessage('');

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

      const submitUserProfile = await addUserProfile(userProfileData);
      if (submitUserProfile) {
        Alert.alert('Successfully updated !!', 'Your profile is now up to date.', [
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
      } else {
        Alert.alert('Update unsuccessful !!', 'Your profile cannot be updated at the moment.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('HomePage');
            }
          }
        ]);
      }
    } else {
      setErrorMessage('Please fill in all the required fields.');
    }
  }

  const allTimezones = moment.tz.names();

  const currencies = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'INR - Indian National Rupee', value: 'INR' },
  ];

  const launchDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleUserName = (username) => {  
    if(username !== existingUserName) {  
      checkUniqueUserName(username, (isUnique) => {
        if (isUnique) {
          setUserNameError('This username is already taken. Please choose another one.');
          setErrorColour('red');
          setUsername('')
        } else {
          setErrorColour('red');
          setUserNameError('Username is available.');
        }
      });
    }
    setUserNameError('');
  }

  const showHelp = () => {
    setHelpVisible(true);
  }

  const hideHelp = () => {
    setHelpVisible(false);
  }

  UserProfile.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.editContainer}>
        {!edit ? (
          <TouchableOpacity style={styles.editProfile} onPress={() => setEdit(true)}>
            <Text style={{ color: 'white' }}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.viewProfile} onPress={() => setEdit(false)}>
            <Text style={{ color: 'white' }}>View Profile</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.card}>
        <View style={{flexDirection:'row' ,alignItems: 'center',marginBottom:5}}>
        <Text style={styles.cardTitle}>User Profile</Text>
        <IconButton
          icon="help-circle-outline"
          size={24}
          mode="contained"
          onPress={showHelp}
          style={[{marginLeft:"50%", marginTop:-4}]}
        />
        { <RNModal
          visible={helpVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={hideHelp}
        >

          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Help</Text>
              <Text style={styles.modalText}>
                How to Edit? : Switch between edit and view mode using edit profile button.
              </Text>
              <Text style={styles.modalText}>
                How to choose user name ? : Enter your choice of username and check availability using button beside text input. You can only pick an available user name.
              </Text>
              <Text style={styles.modalText}>
                Want to add address and currency ? : Use More Details button to add additional details.
              </Text>
              <Button mode="contained" onPress={hideHelp}>OK</Button>
            </View>
          </View>
        </RNModal>
          }
        </View>

        <Text style={styles.legend}>Username *</Text>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          <TextInput
            style={[styles.usernameInput]}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            editable={edit}
          />
          {edit && (
            <IconButton
              icon="check"
              size={24}
              mode="contained"
              onPress={() => handleUserName(username)}
              style={[styles.iconButton,{marginTop: -1}]}
            />
          )}
        </View>
        {isComponentMounted && edit && (
          <Text style={styles.errorText}>{userNameError}</Text>
        )}
            <Text style={styles.legend}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={(value) => { setFirstName(value) }}
              editable={edit}
            />
            <Text style={styles.legend}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={(value) => { setLastName(value) }}
              editable={edit}
            />
            <Text style={styles.legend}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => { setGender(itemValue) }}
                enabled={edit}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Prefer Not to Say" value="Prefer not to say" />
              </Picker>
            </View>

        <Text style={styles.legend}>Email *</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          placeholder="Email"
          value={email}
          editable={false}
        />
        <Text style={styles.legend}>Contact Number</Text>
            <View style={styles.row}>
              <View style={styles.extension}>
                {edit ? (
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
                    value={extension && extension.callingCode ? `+${extension.callingCode[0]}` : ''}
                    editable={false}
                  />
                )}
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
      <Text style={styles.legend}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={(value) => setAddress(value)}
              editable={edit}
            />
            <Text style={styles.legend}>Country *</Text>
            {edit ? (
              <CountryPicker
                {...{
                  countryCode: country ? country.cca2 : 'US',
                  withFilter: true,
                  withFlag: true,
                  withCountryNameButton: true,
                  onSelect: (selectedCountry) => setCountry(selectedCountry),
                }}
              />
            ) : (
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={country ? country.name : 'Select Country'}
                editable={false}
              />
            )}
      <View style= {{flexDirection:'row'}}>
        <Text style={[styles.legend,{paddingRight:15}]}>Date of Birth</Text>          
        <IconButton
          icon="calendar"
          size={30}
          mode="contained"
          onPress={launchDatePicker}
          disabled={!edit}
          style={[styles.iconButton,{marginTop:-4}]}
        />  
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="calendar" 
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDob(selectedDate);
              }
            }}
          />
      )}
      </View>
      <Text>{dob.toDateString()}</Text>
        <TouchableOpacity onPress={() => setShowDetails(!showDetails)} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {showDetails ? 'Less Details' : 'More Details'}
          </Text>
        </TouchableOpacity>

        {showDetails && (
          <>
            <Text style={styles.legend}>Timezone</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={timezone}
                style={styles.picker}
                onValueChange={(itemValue) => setTimezone(itemValue)}
                enabled={edit}
              >
                {allTimezones.map((timeZone) => (
                  <Picker.Item key={timeZone} label={`${timeZone} (${moment.tz(timeZone).format('Z')})`} value={timeZone} />
                ))}
              </Picker>
            </View>
            <Text style={styles.legend}>Preferred Currency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={preferredCurrency}
                style={styles.picker}
                onValueChange={(itemValue) => { setPreferredCurrency(itemValue) }}
                enabled={edit}
              >
                {currencies.map((currency, index) => (
                  <Picker.Item key={index} label={currency.label} value={currency.value} />
                ))}
              </Picker>
            </View>
          </>
        )}
        <Text style={[styles.errorText,{color:errorColour}]}>{errorMessage}</Text>
        {edit && (
          <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={{ color: 'white' }}>Submit</Text>
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
  editContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: height * 0.025,
  },
  viewProfile: {
    backgroundColor: 'green',
    marginRight: 10,
    marginTop: 5,
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  editProfile: {
    marginRight: 10,
    marginTop: 5,
    backgroundColor: '#1877F2',
    padding: 10,
    borderRadius: 5
  },
  errorText: {
    margin:2
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
    marginTop: height * 0.01,
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
  usernameInput: {
    height: height * 0.05,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
    flex: 1, 
    marginRight: 10,
  },
  iconButton: {
    flex: 0,
  },
  submitButton: {
    backgroundColor: 'green',
    padding: width * 0.02,
    borderRadius: 50,
    marginTop: height * 0.006,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#1877F2',
    padding: width * 0.02,
    borderRadius: 5,
    marginTop: height * 0.02,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: FontPreferences.sizes.medium,
  },  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: width * 0.8, 
    maxHeight: height * 0.6, 
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default UserProfile;

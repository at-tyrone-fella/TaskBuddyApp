import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Card, Button } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import { FontPreferences } from "../utility/FontPreferences";
import { Picker } from "@react-native-picker/picker";
import CountryPicker from "react-native-country-picker-modal";
import moment from "moment-timezone";
import { createClientUser, createClientOrganization } from "../FireBaseInteractionQueries/client";

const CreateClient = ({ navigation, screenName, setClientCreationID, setShowCreateClientForm }) => {
    const [clientName, setClientName] = useState("");
    const [clientBusinessNumber, setClientBusinessNumber] = useState("");
    const [clientContactNumber, setClientContactNumber] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientLocation, setClientLocation] = useState(null);
    const [clientTimezone, setClientTimezone] = useState("");
    const [error, setError] = useState("");

    const createClient = () => {
        if (clientName === "" || clientContactNumber === "" || clientEmail === "" ) {
            setError("Please fill in all fields.");
            return;
        } else {
            const clientSetupData = {
                clientName: clientName,
                clientBusinessNumber: clientBusinessNumber,
                clientContactNumber: clientContactNumber,
                clientAddress: clientAddress,
                clientEmail: clientEmail,
                clientLocation: clientLocation,
                clientTimezone: clientTimezone,
            };

            if (screenName === "SetupOrganization") {
                    createClientOrganization(clientSetupData, (clientCreationID) => {
                    setClientCreationID(clientCreationID);
                    setShowCreateClientForm(false);

                });
            } else {
                createClientUser(clientSetupData);
                navigation.navigate('HomePage'); 
            }
        }
        setError("");
    };

    const allTimezones = moment.tz.names();

    return (
        <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Create Client</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Client Name"
                    value={clientName}
                    onChangeText={setClientName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Client Business Number"
                    value={clientBusinessNumber}
                    onChangeText={setClientBusinessNumber}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Client Contact Number"
                    keyboardType="phone-pad"
                    value={clientContactNumber}
                    onChangeText={setClientContactNumber}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Client Address"
                    value={clientAddress}
                    onChangeText={setClientAddress}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Client Email Address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                />
                <View style={styles.countryPickerContainer}>
                    <CountryPicker
                        withFilter
                        withFlag
                        withCountryNameButton
                        onSelect={setClientLocation}
                        containerButtonStyle={styles.countryPicker}
                    />
                    <Text style={styles.countryPickerText}>
                        {clientLocation ? clientLocation.name : "Select Client Location"}
                    </Text>
                </View>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={clientTimezone}
                        style={styles.picker}
                        onValueChange={(itemValue) => setClientTimezone(itemValue)}
                    >
                        {allTimezones.map((timeZone) => (
                            <Picker.Item key={timeZone} label={`${timeZone} (${moment.tz(timeZone).format('Z')})`} value={timeZone} />
                        ))}
                    </Picker>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={createClient}
                        style={styles.button}
                    >
                        Create Client
                    </Button>
                    {screenName === "SetupOrganization" || screenName === "createClient" ? (
                        <Button
                            mode="contained"
                            style={styles.button}
                            onPress={() => setShowCreateClientForm(false)}
                        >
                            Back
                        </Button>
                    ) : null}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: height * 0.05,
        padding: Math.round(width * 0.02 + height * 0.04) / 2,
        borderRadius: Math.round(width * 0.02 + height * 0.04) / 2,
        width: width * 0.8,
        alignSelf: 'center',
    },
    container: {
        alignItems: "center",
    },
    text: {
        fontSize: 18,
        padding: 8,
        marginBottom: height * 0.015,
    },
    input: {
        width: "100%",
        marginBottom: height * 0.015,
        padding: width * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: Math.round(width * 0.02 + height * 0.04) / 2,
    },
    pickerContainer: {
        width: "100%",
        marginBottom: height * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: Math.round(width * 0.02 + height * 0.04) / 2,
    },
    picker: {
        width: "100%",
    },
    countryPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: height * 0.015,
        padding: width * 0.015,
    },
    countryPickerText: {
        marginLeft: 8,
        fontSize: FontPreferences.sizes.small,
    },
    buttonContainer: {
        width: "70%",
        alignItems: "center",
        marginTop: height * 0.020,
    },
    button: {
        width: 250,
        borderRadius: 25,
        margin: 10,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
});

export default CreateClient;

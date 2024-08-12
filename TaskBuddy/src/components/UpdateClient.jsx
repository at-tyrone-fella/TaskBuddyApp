import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Card, Button } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import { FontPreferences } from "../utility/FontPreferences";
import { Picker } from "@react-native-picker/picker";
import CountryPicker from "react-native-country-picker-modal";
import moment from "moment-timezone";
import { updateClientDetails } from "../FireBaseInteractionQueries/client";


const UpdateClient = ({ navigation, screenName, setShowUpdateClientForm, client, setUpdatedClient }) => {

    const [clientName, setClientName] = useState(client.clientName || "");
    const [clientBusinessNumber, setClientBusinessNumber] = useState(client.clientBusinessNumber || "");
    const [clientContactNumber, setClientContactNumber] = useState(client.clientContactNumber || "");
    const [clientAddress, setClientAddress] = useState(client.clientAddress || "");
    const [clientEmail, setClientEmail] = useState(client.clientEmail || "");
    const [clientLocation, setClientLocation] = useState(client.clientLocation || null);
    const [clientTimezone, setClientTimezone] = useState(client.clientTimezone || "");
    const [edit, setEdit] = useState();
    const [error, setError] = useState("");

    const handleEditToggle = () => {
        setEdit(!edit);
    };

    const updateClient = () => {
        if (clientName === "" || clientContactNumber === "" || clientEmail === "" ) {
            setError("Please fill in all fields.");
            return;
        }
        else{
            const clientSetupData = {
                clientName: clientName,
                clientBusinessNumber: clientBusinessNumber,
                clientContactNumber: clientContactNumber,
                clientAddress: clientAddress,
                clientEmail: clientEmail,
                clientLocation: clientLocation,
                clientTimezone: clientTimezone,       
            }

            const updateResult = updateClientDetails(client.id, clientSetupData);

            if(updateResult) {
                setShowUpdateClientForm(false);
                setUpdatedClient(true);
            }
            else{
                setError("Error updating client. Please try again.");
            }
        }
        setError("");
    };

    const allTimezones = moment.tz.names();

    return (
        <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Update Client</Text>
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    placeholder="Client Name"
                    value={clientName}
                    onChangeText={setClientName}
                    editable={edit}
                />
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    placeholder="Client Business Number"
                    value={clientBusinessNumber}
                    onChangeText={setClientBusinessNumber}
                    editable={edit}
                />
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    placeholder="Client Contact Number"
                    keyboardType="phone-pad"
                    value={clientContactNumber}
                    onChangeText={setClientContactNumber}
                    editable={edit}
                />
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    placeholder="Client Address"
                    value={clientAddress}
                    onChangeText={setClientAddress}
                    editable={edit}
                />
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    placeholder="Client Email Address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    editable={edit}
                />
                <View style={styles.countryPickerContainer}>
                    <CountryPicker
                        withFilter
                        withFlag
                        withCountryNameButton
                        onSelect={setClientLocation}
                        containerButtonStyle={[styles.countryPicker, !edit && styles.disabledInput]}
                        disabled={!edit}
                    />
                    <Text style={[styles.countryPickerText, !edit && styles.disabledInput]}>
                        {clientLocation ? clientLocation.name : "Select Client Location"}
                    </Text>
                </View>
                <View style={[styles.pickerContainer, !edit && styles.disabledInput]}>
                    <Picker
                        selectedValue={clientTimezone}
                        style={styles.picker}
                        onValueChange={(itemValue) => setClientTimezone(itemValue)}
                        enabled={edit}
                    >
                        {allTimezones.map((timeZone) => (
                            <Picker.Item key={timeZone} label={`${timeZone} (${moment.tz(timeZone).format('Z')})`} value={timeZone} />
                        ))}
                    </Picker>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View style={styles.buttonContainer}>     
                    {edit ? <Button mode="contained" style={styles.button} onPress={updateClient}>Save</Button> : <Button mode="contained" style={styles.button} onPress={handleEditToggle}>Edit</Button>}
                    <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => setShowUpdateClientForm(false)}
                    >
                        Back
                    </Button>
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
    disabledInput: {
        backgroundColor: "#f0f0f0",
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
    editButton: {
        marginTop: 10,
        padding: 10,
        width: "120%",
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default UpdateClient;

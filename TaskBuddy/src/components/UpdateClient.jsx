import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Switch } from "react-native";
import { Card, Button } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import { FontPreferences } from "../utility/FontPreferences";
import CountryPicker from "react-native-country-picker-modal";
import { updateClientDetails } from "../FireBaseInteraction/client";
import PropTypes from 'prop-types';

const UpdateClient = ({ setShowUpdateClientForm, client, setUpdatedClient }) => {

    console.log("isClientActive",client.isClientActive);

    const [clientName, setClientName] = useState(client.clientName || "");
    const [clientBusinessNumber, setClientBusinessNumber] = useState(client.clientBusinessNumber || "");
    const [clientContactNumber, setClientContactNumber] = useState(client.clientContactNumber || "");
    const [clientAddress, setClientAddress] = useState(client.clientAddress || "");
    const [clientEmail, setClientEmail] = useState(client.clientEmail || "");
    const [clientLocation, setClientLocation] = useState(client.clientLocation || null);
    const [isClientActive, setIsClientActive] = useState(client.isClientActive);
    const [edit, setEdit] = useState(false);
    const [error, setError] = useState("");

    const handleEditToggle = () => {
        setEdit(!edit);
    };

    const updateClient = () => {
        if (clientName === "" || clientContactNumber === "" || clientEmail === "") {
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
                isClientActive: isClientActive,
            };

            const updateResult = updateClientDetails(client.id, clientSetupData);

            if (updateResult) {
                setShowUpdateClientForm(false);
                setUpdatedClient(true);
            } else {
                setError("Error updating client. Please try again.");
            }
        }
        setError("");
    };

    /*
    Added PropTypes for UpdateClient
    */
    UpdateClient.propTypes = {
        setShowUpdateClientForm: PropTypes.func.isRequired,
        client: PropTypes.object.isRequired,
        setUpdatedClient: PropTypes.func.isRequired,
    };

    return (
        <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Update Client</Text>

                <Text style={styles.label}>Client Name *</Text>
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    value={clientName}
                    onChangeText={setClientName}
                    editable={edit}
                />

                <Text style={styles.label}>Client Business Number</Text>
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    value={clientBusinessNumber}
                    onChangeText={setClientBusinessNumber}
                    editable={edit}
                />

                <Text style={styles.label}>Client Contact Number *</Text>
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    keyboardType="phone-pad"
                    value={clientContactNumber}
                    onChangeText={setClientContactNumber}
                    editable={edit}
                />

                <Text style={styles.label}>Client Address</Text>
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    value={clientAddress}
                    onChangeText={setClientAddress}
                    editable={edit}
                />

                <Text style={styles.label}>Client Location</Text>
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


                <Text style={styles.label}>Client Email Address *</Text>
                <TextInput
                    style={[styles.input, !edit && styles.disabledInput]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    editable={edit}
                />

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>Active Client</Text>
                    <Switch
                        value={isClientActive}
                        onValueChange={setIsClientActive}
                        disabled={!edit}
                    />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.buttonContainer}>
                    {edit ? (
                        <Button mode="contained" style={styles.button} onPress={updateClient}>
                            Save
                        </Button>
                    ) : (
                        <Button mode="contained" style={styles.button} onPress={handleEditToggle}>
                            Edit
                        </Button>
                    )}
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
        width: width * 0.9,
        alignSelf: 'center',
    },
    container: {},
    text: {
        fontSize: 18,
        padding: 8,
        fontWeight: "bold",
        marginLeft: width * 0.25,
        marginBottom: height * 0.03,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        width: "100%",
        marginBottom: height * 0.015,
        padding: width * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: 2,
    },
    disabledInput: {
        backgroundColor: "#f0f0f0",
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
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: "100%",
        marginBottom: height * 0.015,
        padding: width * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: Math.round(width * 0.02 + height * 0.04) / 2,
    },
    buttonContainer: {
        width: "70%",
        marginLeft: width * 0.055,
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

export default UpdateClient;

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Card, Button } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import { FontPreferences } from "../utility/FontPreferences";
import CountryPicker from "react-native-country-picker-modal";
import { createClient } from '../ApplicationLayer/createClientLogic';  
import PropTypes from 'prop-types';

const CreateClient = ({ navigation, screenName, setClientCreationID, setShowCreateClientForm }) => {
    const [clientName, setClientName] = useState("");
    const [clientBusinessNumber, setClientBusinessNumber] = useState("");
    const [clientContactNumber, setClientContactNumber] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientLocation, setClientLocation] = useState(null);
    const [error, setError] = useState("");

const handleCreateClient = async () => {
        const clientData = {
            clientName,
            clientBusinessNumber,
            clientContactNumber,
            clientAddress,
            clientEmail,
            clientLocation
        };

        const errorMessage = await createClient(
            clientData,
            screenName,
            setClientCreationID,
            setShowCreateClientForm
        );

        if (errorMessage) {
            setError(errorMessage);
        } else {
            setError("");
        }
    };

    /**
     * PropTypes added
     */
    CreateClient.propTypes = {
        navigation: PropTypes.shape({
            navigate: PropTypes.func.isRequired,
        }).isRequired,
        screenName: PropTypes.string.isRequired,
        setClientCreationID: PropTypes.func.isRequired,
        setShowCreateClientForm: PropTypes.func.isRequired,
    };

    return (
        <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Create Client</Text>

                <Text style={styles.label}>Client Name *</Text>
                <TextInput
                    style={styles.input}
                    value={clientName}
                    onChangeText={setClientName}
                />

                <Text style={styles.label}>Client Business Number</Text>
                <TextInput
                    style={styles.input}
                    value={clientBusinessNumber}
                    onChangeText={setClientBusinessNumber}
                />

                <Text style={styles.label}>Client Contact Number *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={clientContactNumber}
                    onChangeText={setClientContactNumber}
                />

                <Text style={styles.label}>Client Address</Text>
                <TextInput
                    style={styles.input}
                    value={clientAddress}
                    onChangeText={setClientAddress}
                />
                <Text style={styles.label}>Client Location</Text>
 
                <View style={styles.countryPickerContainer}>
                    <CountryPicker
                        withFilter
                        withFlag
                        withCountryNameButton
                        onSelect={setClientLocation}
                        
                    />
                    <Text style={styles.countryPickerText}>
                        {clientLocation ? clientLocation.name : ''}
                    </Text>
                </View>

                <Text style={styles.label}>Client Email Address *</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleCreateClient}
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
        width: width * 0.9,
        alignSelf: 'center',
    },
    container: {
        alignItems: "center",
    },
    text: {
        fontSize: FontPreferences.sizes.large,
        padding: 8,
        fontWeight: "bold",
        marginBottom: height * 0.015,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    input: {
        width: "100%",
        marginBottom: height * 0.015,
        padding: width * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: 5,
    },
    countryPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        marginBottom: height * 0.015,
        width: width * 0.8,
        padding: width * 0.015,
        borderWidth: 2
    },
    countryPickerText: {
        marginLeft: 8,
        fontSize: FontPreferences.sizes.medium,
        color:'blue'
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

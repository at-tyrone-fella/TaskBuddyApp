import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Card, Button, Checkbox } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import { FontPreferences } from "../utility/FontPreferences";
import { createUser,  getMessages }  from "../auth/signUp";

const SignUpForm = ({ navigation }) => {

    /**Setting up state for Email and Password */
    const [checked, setChecked] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const createSignUp = () => {

        if(email === "" || password === "" || confirmPassword === "") {
            setError("Please fill in all fields.");
            setIsSubmitted(false);
            return;
        }

        if (password !== confirmPassword) {
            setIsSubmitted(true);
            setError("Passwords do not match.");
            return;
        }

        setError("");
        
        if (!checked) {
            setError("You must agree to join TaskBuddy.");
            setIsSubmitted(false);
            return;
        }
        
        createUser(email, password,
        () => {
            navigation.navigate('ScrollSignInScreen', {userRegistered: true});
            },
        (errorMessage) => {
            setError(getMessages(errorMessage));
        });
};

    return (
        <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Sign Up</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value = {email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value = {password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value = {confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={styles.checkboxContainer}>
                    <Checkbox
                        status={checked ? 'checked' : 'unchecked'}
                        onPress={() => setChecked(!checked)}
                    />
                    <Text style={[styles.checkboxText, isSubmitted && !checked && styles.highlight]}>I want to join TaskBuddy.</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <Button mode="contained" onPress={() => {
                      createSignUp(email,password,confirmPassword);
                    }}
                    style={styles.button}>Sign Up</Button>
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
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.015,
    },
    checkboxText: {
        marginLeft: 8,
        fontSize: FontPreferences.sizes.small,
    },
    buttonContainer: {
        width: "70%",
        alignItems: "center",
        marginTop: height * 0.020,
    },
    smallText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: height * 0.025,
    },
    button: {
        width: 250,
        borderRadius: 25,
    },
    errorText: {
    color: 'red',
    marginBottom: 10,
  },
  checkboxChecked: {
    width: 16,
    height: 16,
    backgroundColor: '#000',
  },
  highlight: {
    borderColor: 'red',
    borderWidth: 2,
  },
});

export default SignUpForm;

import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Card, Button, Checkbox } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import { FontPreferences } from "../utility/FontPreferences";
import { createUser, getMessages, verifyEmail } from "../auth/signUp";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";

const SignUpForm = ({ navigation }) => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        checked: false,
        showPassword: true,
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);

    const handleChange = (name, value) => {
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const createSignUp = () => {
        const { email, password, confirmPassword, checked } = form;

        if (!email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!checked) {
            setError("You must agree to join TaskBuddy.");
            return;
        }

        createUser(
            email,
            password,
            () => navigation.navigate("ScrollSignInScreen", { userRegistered: true }),
            errorMessage => {
                setError(getMessages(errorMessage));
                Alert.alert("Sign-Up Failed", "Please try again later.", [{ text: "OK" }]);
            }
        );
    };

    const handleVerifyEmail = async () => {
        try {
            const isValid = await verifyEmail(form.email);
            setIsEmailValid(isValid);
            setSuccessMessage(isValid ? "Email verified successfully." : "Invalid email format or email does not exist.");
        } catch {
            setError("Error verifying email.");
        }
    };

    return (
        <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Sign Up</Text>

                <View style={styles.emailContainer}>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={form.email}
                        onChangeText={value => handleChange("email", value)}
                    />
                    <Button
                        mode="contained"
                        onPress={handleVerifyEmail}
                        style={styles.verifyButton}
                        disabled={!form.email.trim()}
                    >
                        Verify
                    </Button>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={form.password}
                    onChangeText={value => handleChange("password", value)}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        secureTextEntry={form.showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={form.confirmPassword}
                        onChangeText={value => handleChange("confirmPassword", value)}
                    />
                    <MaterialCommunityIcons
                        name={form.showPassword ? "eye-off" : "eye"}
                        size={24}
                        color="#aaa"
                        style={styles.icon}
                        onPress={() => handleChange("showPassword", !form.showPassword)}
                    />
                </View>

                <View style={styles.checkboxContainer}>
                    <Checkbox
                        status={form.checked ? "checked" : "unchecked"}
                        onPress={() => handleChange("checked", !form.checked)}
                    />
                    <Text style={styles.checkboxText}>I want to join TaskBuddy.</Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={createSignUp}
                        style={styles.button}
                        disabled={!isEmailValid}
                    >
                        Sign Up
                    </Button>
                </View>
            </View>
        </Card>
    );
};

SignUpForm.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

const styles = StyleSheet.create({
    card: {
        marginVertical: height * 0.05,
        padding: width * 0.04,
        borderRadius: 12,
        width: width * 0.9,
        alignSelf: "center",
    },
    container: {
        alignItems: "center",
    },
    text: {
        fontSize: 18,
        marginBottom: height * 0.015,
    },
    emailContainer: {
        width: "100%",
        marginBottom: height * 0.015,
    },
    emailInput: {
        width: "100%",
        marginBottom: height * 0.01,
    },
    input: {
        width: "100%",
        marginBottom: height * 0.015,
        padding: width * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: 12,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#ccc",
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
        marginTop: height * 0.02,
    },
    button: {
        width: 250,
        borderRadius: 25,
    },
    verifyButton: {
        marginLeft: "10%",
        width: "80%",
        borderRadius: 25,
    },
    errorText: {
        color: "red",
        marginBottom: 10,
    },
    successText: {
        color: "green",
        marginBottom: 10,
    },
    icon: {
        position: "absolute",
        right: 10,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default SignUpForm;

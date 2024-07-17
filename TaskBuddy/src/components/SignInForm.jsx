import { React, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Button } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import SignInUser from "../auth/SignIn";
import { useAuth } from '../auth/AuthContext.js';    

const SignInForm = ({ navigation }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const SignIn = (email,password) => {

                if(email === "" || password === "") {
                    setError("Please enter email and password.");
                    return false;
                }
                else{
                    setError("");
                    SignInUser(email,password,navigation,login,
                        () => {
                            navigation.navigate('HomePage', {email: email});
                        },
                        (errorMessage) => {
                            setError(errorMessage);
                        }
                    );
                }
            }

    return (
         <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Sign In</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    autoCorrect={false}
                    onChangeText={(text) => {
                        setEmail(text);
                        setError("");
                    }}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    autoCorrect={false}
                    onChangeText={(text) => {
                        setPassword(text);
                        setError("");
                    }}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Text style={styles.smallText}>
                    Not a member? 
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('ScrollSignUp')}>
                    <Text style={styles.smallTextLink}>Sign up now!</Text>
                </TouchableOpacity>
                <View style={styles.buttonContainer}>
                    <Button mode="contained" onPress={() => {SignIn(email,password)}} style={styles.button} >Sign In</Button>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: width * 0.04,
        marginVertical: height * 0.02,
        padding: Math.round(width * 0.02 + height * 0.04) / 2,
        borderRadius: Math.round(width * 0.02 + height * 0.04) / 2,
        },
    container: {
        alignItems: "center",
    },
    text: {
        fontSize: 18,
        padding: 8,
    },
    input: {
        width: "100%",
        marginBottom: height * 0.015,
        padding: width * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: Math.round(width * 0.02 + height * 0.04) / 2,
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
    smallTextLink: {
        fontSize: 12,
        color: 'blue',
        textAlign: 'center',
        marginTop: height * 0.025,
    },
    button : {
        width: 250,
        borderRadius: 25,
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
    },
});

export default SignInForm;
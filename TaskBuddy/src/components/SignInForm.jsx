import { React, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Button } from "react-native-paper";
import { width, height } from "../utility/DimensionsUtility";
import SignInUser from "../auth/SignIn";
import { useAuth } from '../auth/AuthContext.js';  
import { MaterialCommunityIcons } from "@expo/vector-icons";  
import PropTypes from 'prop-types';

const SignInForm = ({ navigation }) => {

    const [email, setEmail] = useState("at56725111998@gmail.com");
    const [password, setPassword] = useState("at567@A");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(true);

    const switchShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const { login } = useAuth();

    const SignIn = (email,password) => {
        if(email === "" || password === "") {
            setError("Please enter email and password.");
            return false;
        } else {
            setError("");
            SignInUser(email, password, login,
                async () => {
                    navigation.navigate('HomePage');
                },
                (errorMessage) => {
                    setError(errorMessage);
                }
            );
        }
    }

    /*
    Added PropTypes for SignInForm
    */
    SignInForm.propTypes = {
      navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
      setShowSidePanel: PropTypes.func.isRequired,
    };

    return (
         <Card style={styles.card}>
            <View style={styles.container}>
                <Text style={styles.text}>Sign In</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(text) => {
                        setEmail(text);
                        setError("");
                    }}
                />
                <View style={styles.inputContainer}> 
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        autoCapitalize="none"
                        value={password}
                        autoCorrect={false}
                        secureTextEntry={showPassword}
                        onChangeText={(text) => {
                            setPassword(text);
                            setError("");
                        }}
                    />
                    <MaterialCommunityIcons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#aaa"
                        style={styles.icon} 
                        onPress={switchShowPassword} 
                    />
                </View>
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
        width: width * 0.9,
    },
    container: {
        alignItems: "center",
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        width: "99%",
    },
    text: {
        fontSize: 18,
        padding: 8,
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
        marginTop: height * 0.020,
    },
    resetPassword: {
        fontSize: 12,
        color: 'blue',
        textAlign: 'right',
    },
    input: {
        width: "100%",
        marginBottom: height * 0.015,
        padding: width * 0.015,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: Math.round(width * 0.02 + height * 0.04) / 2,
    },
    button : {
        width: 250,
        borderRadius: 25,
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
    },
    icon: {
        position: 'absolute',
        right: 10,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SignInForm;

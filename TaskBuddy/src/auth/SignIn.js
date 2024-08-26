import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Alert } from 'react-native';

const SignInUser = (email, password, login, onSuccess, onError) => {

    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password, onSuccess, onError)
        .then((userCredential) => {
            const user = {
                userId: userCredential.user.uid,
                email: userCredential.user.email,
                token: userCredential.user.stsTokenManager.accessToken,
                refreshToken: userCredential.user.stsTokenManager.refreshToken
            };
            Alert.alert('Sign In Successful!', `Welcome back, ${userCredential.user.email}!`, [
                {
                    text: 'OK',
                    onPress: () => {
                        login(user);
                    }
                }
            ]);
        })
        .catch((error) => {
            console.log("Error signing in: ", error.message);
            onError("Invalid email or password");            
        });
};

export default SignInUser;
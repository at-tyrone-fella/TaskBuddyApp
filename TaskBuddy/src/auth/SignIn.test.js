import SignInUser from './SignIn'; 
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { describe } from 'node:test';
import { Alert } from 'react-native';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));


describe("SignInUser", () => { beforeEach(() => {
        jest.clearAllMocks();
      });
    


it("should call login and show alert upon successful login", async () => {
  const mockEmail = "at56725111998@gmail.com";
  const mockPassword = "Pawg@1000";
  const mockUserCredential = {
    user:{
    uid: "12345",
    email: mockEmail,
    stsTokenManager: {
      accessToken: "12345",
      refreshToken: "refreshToken", 
      }  
    }
  }

  const login = jest.fn();
  const onSuccess = jest.fn();
  const onError = jest.fn();

  signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

  await SignInUser(mockEmail, mockPassword, login, onSuccess, onError);

  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(getAuth(), mockEmail, mockPassword, onSuccess, onError);

  expect(Alert.alert).toHaveBeenCalledWith("Sign In Successful!", `Welcome back, ${mockEmail}!`, [
    {
      text: 'OK',
      onPress: expect.any(Function)
    }
  ]);

  const okButtonPress = Alert.alert.mock.calls[0][2][0].onPress;
  okButtonPress();

  expect(login).toHaveBeenCalledWith({
    userId: mockUserCredential.user.uid,
    email: mockUserCredential.user.email,
    token: mockUserCredential.user.stsTokenManager.accessToken,
    refreshToken: mockUserCredential.user.stsTokenManager.refreshToken
  });
  });

  it("should call onError upon failed login", async () => {
    const mockEmail = "test@example.com";
    const mockPassword = "incorrectPassword";
    const mockError = new Error("Invalid email or password");

    const login = jest.fn(); 
    const onSuccess = jest.fn(); 
    const onError = jest.fn(); 

    signInWithEmailAndPassword.mockRejectedValue(mockError.message);

    SignInUser(mockEmail, mockPassword, login, onSuccess, onError);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(getAuth(), mockEmail, mockPassword, onSuccess, onError);

    expect(login).not.toHaveBeenCalled();
    
    expect(onSuccess).not.toHaveBeenCalled();

  });

});


import AddScrollView from "./AddScrollView";

//Import Screens and wrap them with AddScrollView here
import Landing from "../screens/Landing";
import SignUpScreen from "../screens/SignUpScreen";
import SignInForm from "../components/SignInForm";
import SignInScreen from "../screens/SignInScreen";
import HomePage from "../screens/HomePage";
import UserProfile from "../screens/UserProfile";


const ScrollWrappedLanding = AddScrollView(Landing);
const ScrollWrappedSignUp = AddScrollView(SignUpScreen);
const ScrollWrappedSignInForm = AddScrollView(SignInForm);
const ScrollWrappedSignInScreen = AddScrollView(SignInScreen);
const ScrollWrappedHomePage = AddScrollView(HomePage);
const ScrollWrappedUserProfile = AddScrollView(UserProfile);

export { ScrollWrappedLanding, ScrollWrappedSignUp, ScrollWrappedSignInForm, ScrollWrappedSignInScreen, ScrollWrappedHomePage, ScrollWrappedUserProfile };
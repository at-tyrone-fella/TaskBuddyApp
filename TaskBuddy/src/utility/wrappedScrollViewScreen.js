import AddScrollView from "./AddScrollView";

//Import Screens and wrap them with AddScrollView here
import Landing from "../screens/Landing";
import SignUpScreen from "../screens/SignUpScreen";
import SignInForm from "../components/SignInForm";
import SignInScreen from "../screens/SignInScreen";
import HomePage from "../screens/HomePage";
import UserProfile from "../screens/UserProfile";
import Organizations from "../screens/Organizations";
import Client from "../screens/Client";
import Projects from "../screens/Projects";
import NotificationScreen from "../screens/NotificationScreen";


const ScrollWrappedLanding = AddScrollView(Landing);
const ScrollWrappedSignUp = AddScrollView(SignUpScreen);
const ScrollWrappedSignInForm = AddScrollView(SignInForm);
const ScrollWrappedSignInScreen = AddScrollView(SignInScreen);
const ScrollWrappedHomePage = AddScrollView(HomePage);
const ScrollWrappedUserProfile = AddScrollView(UserProfile);
export const ScrollWrappedOrganization = AddScrollView(Organizations);
export const ScrollWrappedCreateClient = AddScrollView(Client);
export const ScrollWrappedProject = AddScrollView(Projects);
export const ScrollWrappedNotification = AddScrollView(NotificationScreen);

export { ScrollWrappedLanding, ScrollWrappedSignUp, ScrollWrappedSignInForm, ScrollWrappedSignInScreen, ScrollWrappedHomePage, ScrollWrappedUserProfile };
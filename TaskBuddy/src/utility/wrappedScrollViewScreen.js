import AddScrollView from "./AddScrollView";
import Landing from "../screens/Landing";
import SignUpScreen from "../screens/SignUpScreen";
import SignInScreen from "../screens/SignInScreen";
import HomePage from "../screens/HomePage";
import UserProfile from "../screens/UserProfile";
import Organizations from "../screens/Organizations";
import Client from "../screens/Client";
import Projects from "../screens/Projects";
import NotificationScreen from "../screens/NotificationScreen";
import Reports from "../screens/Reports";

/**
 * This component wraps all screens inside ScrollView with AddScrollView
 */
export const ScrollWrappedLanding = AddScrollView(Landing);
export const ScrollWrappedSignUp = AddScrollView(SignUpScreen);
export const ScrollWrappedSignInScreen = AddScrollView(SignInScreen);
export const ScrollWrappedHomePage = AddScrollView(HomePage);
export const ScrollWrappedUserProfile = AddScrollView(UserProfile);
export const ScrollWrappedOrganization = AddScrollView(Organizations);
export const ScrollWrappedCreateClient = AddScrollView(Client);
export const ScrollWrappedProject = AddScrollView(Projects);
export const ScrollWrappedNotification = AddScrollView(NotificationScreen);
export const ScrollWrappedReports = AddScrollView(Reports);

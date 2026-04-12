import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";

import LandingScreen from "../screens/LandingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AIChatScreen from "../screens/AIChatScreen";
import NotificationsScreen from "../screens/common/NotificationsScreen";
import { TouchableOpacity } from "react-native";
import VideoCallScreen from "../screens/common/VideoCallScreen";

import PatientTabs from "./PatientTabs";
import DoctorTabs from "./DoctorTabs";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, userData } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Chat" component={AIChatScreen} />
          </>
        ) : userData?.role === "doctor" ? (
          <>
            <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
            <Stack.Screen name="Chat" component={AIChatScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="PatientTabs" component={PatientTabs} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: "Notifications" }}
            />
            <Stack.Screen name="Chat" component={AIChatScreen} />
          </>
        )}
        <Stack.Screen name="VideoCall" component={VideoCallScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

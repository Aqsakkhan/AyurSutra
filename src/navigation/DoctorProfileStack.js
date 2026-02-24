import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/ProfileScreen";
import AboutScreen from "../screens/AboutScreen";
import ContactScreen from "../screens/ContactScreen";

const Stack = createNativeStackNavigator();

export default function DoctorProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
    </Stack.Navigator>
  );
}

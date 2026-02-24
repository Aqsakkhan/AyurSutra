import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/ProfileScreen";
import AboutScreen from "../screens/AboutScreen";
import ContactScreen from "../screens/ContactScreen";
import DoctorsStack from "./DoctorsStack";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "About Us" }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ title: "Contact Us" }}
      />
    </Stack.Navigator>
  );
}

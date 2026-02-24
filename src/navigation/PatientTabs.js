import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ProfileStack from "./ProfileStack";
import TherapyStack from "./TherapyStack";
import DoctorsStack from "./DoctorsStack";
import AppointmentsScreen from "../screens/patient/AppointmentScreen";
import TherapyCatalogStack from "./TherapyCatalogStack";

const Tab = createBottomTabNavigator();

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1B5E20",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Doctors") iconName = "medkit";
          else if (route.name === "Appointments") iconName = "calendar";
          else if (route.name === "Therapies") iconName = "leaf";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={TherapyStack} />
      <Tab.Screen name="Doctors" component={DoctorsStack} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Therapies" component={TherapyCatalogStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

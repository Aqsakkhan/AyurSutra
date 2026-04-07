import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import DoctorHomeScreen from "../screens/doctor/DoctorHomeScreen";
import PatientsScreen from "../screens/doctor/PatientsScreen";
import DoctorAppointmentsScreen from "../screens/doctor/DoctorAppointmentsScreen";
import DoctorAppointmentDetailScreen from "../screens/doctor/DoctorAppointmentDetailScreen";
import PatientsStack from "./PatientsStack";
import DoctorProfileStack from "./DoctorProfileStack";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 🟢 Appointment Stack (List → Detail)
const AppointmentStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DoctorAppointmentsMain"
        component={DoctorAppointmentsScreen}
      />
      <Stack.Screen
        name="DoctorAppointmentDetail"
        component={DoctorAppointmentDetailScreen}
      />
    </Stack.Navigator>
  );
};

const DoctorTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0B8FAC",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Patients") iconName = "people-outline";
          else if (route.name === "Appointments") iconName = "calendar-outline";
          else if (route.name === "Profile") iconName = "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DoctorHomeScreen} />
      <Tab.Screen name="Patients" component={PatientsStack} />
      {/* 🔥 FIXED HERE */}
      <Tab.Screen name="Appointments" component={AppointmentStack} />
      <Tab.Screen name="Profile" component={DoctorProfileStack} />
    </Tab.Navigator>
  );
};

export default DoctorTabs;

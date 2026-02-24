import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PatientHome from "../screens/patient/PatientHome";
import MyAppointmentsScreen from "../screens/patient/MyAppointmentsScreen";
import TherapyDetailsScreen from "../screens/patient/TherapyDetailsScreen";
import TherapyCatalogScreen from "../screens/patient/TherapyCatalogScreen";
import AboutScreen from "../screens/AboutScreen";

const Stack = createNativeStackNavigator();

export default function TherapyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={PatientHome}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MyAppointments"
        component={MyAppointmentsScreen}
        options={{ title: "My Appointments" }}
      />

      <Stack.Screen name="Therapies" component={TherapyCatalogScreen} />

      <Stack.Screen name="TherapyDetail" component={TherapyDetailsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

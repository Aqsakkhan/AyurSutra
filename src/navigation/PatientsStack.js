import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PatientsScreen from "../screens/doctor/PatientsScreen";
import PatientDetailScreen from "../screens/doctor/PatientDetailScreen";

const Stack = createNativeStackNavigator();

export default function PatientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientsMain" component={PatientsScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
    </Stack.Navigator>
  );
}

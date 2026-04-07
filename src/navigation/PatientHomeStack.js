import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PatientHome from "../screens/patient/PatientHome";
import PrescriptionsScreen from "../screens/patient/PrescriptionsScreen";

const Stack = createNativeStackNavigator();

export default function PatientHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientHome" component={PatientHome} />
      <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} />
    </Stack.Navigator>
  );
}

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PatientHome from "../screens/patient/PatientHome";
import TherapyCatalogScreen from "../screens/patient/TherapyCatalogScreen";
import TherapyDetailsScreen from "../screens/patient/TherapyDetailsScreen";
import PrescriptionsScreen from "../screens/patient/PrescriptionsScreen";
import PrescriptionDetailScreen from "../screens/patient/PrescriptionDetailScreen";

const Stack = createNativeStackNavigator();

export default function TherapyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Home Screen */}
      <Stack.Screen name="PatientHome" component={PatientHome} />

      <Stack.Screen name="TherapyCatalog" component={TherapyCatalogScreen} />
      <Stack.Screen name="TherapyDetails" component={TherapyDetailsScreen} />

      <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} />
      <Stack.Screen
        name="PrescriptionDetail"
        component={PrescriptionDetailScreen}
      />
    </Stack.Navigator>
  );
}

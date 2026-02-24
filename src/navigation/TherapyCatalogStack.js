import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TherapyCatalogScreen from "../screens/patient/TherapyCatalogScreen";
import TherapyDetailsScreen from "../screens/patient/TherapyDetailsScreen";

const Stack = createNativeStackNavigator();

export default function TherapyCatalogStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TherapyCatalog"
        component={TherapyCatalogScreen}
        options={{ title: "Therapies" }}
      />
      <Stack.Screen
        name="TherapyDetail"
        component={TherapyDetailsScreen}
        options={{ title: "Therapy Details" }}
      />
    </Stack.Navigator>
  );
}

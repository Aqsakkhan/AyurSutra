import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DoctorsScreen from "../screens/patient/DoctorsScreen";
import AppointmentBookingScreen from "../screens/patient/AppointmentBookingScreen";
import PatientDetailScreen from "../screens/doctor/PatientDetailScreen";
import AddPrescriptionScreen from "../screens/doctor/AddPrescriptionScreen";

const Stack = createNativeStackNavigator();

export default function DoctorsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorsList" component={DoctorsScreen} />
      <Stack.Screen
        name="AppointmentBooking"
        component={AppointmentBookingScreen}
      />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <Stack.Screen name="AddPrescription" component={AddPrescriptionScreen} />
    </Stack.Navigator>
  );
}

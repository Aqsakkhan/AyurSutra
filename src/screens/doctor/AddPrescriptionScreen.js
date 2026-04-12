import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";

export default function AddPrescriptionScreen({ route, navigation }) {
  const { appointment } = route.params || {};
  const { user } = useContext(AuthContext);

  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!appointment) {
      Alert.alert("Error", "No appointment data");
      return;
    }
    if (!diagnosis || !medicines) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      await addDoc(collection(db, "prescriptions"), {
        doctorId: user.uid,
        doctorName: user.fullName,
        doctorSpecialization: user.specialization, // ✅ important
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        appointmentId: appointment.id,

        diagnosis,
        medicines,
        notes,

        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Prescription added successfully");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Add Prescription
      </Text>

      {/* Diagnosis */}
      <Text>Diagnosis</Text>
      <TextInput
        value={diagnosis}
        onChangeText={setDiagnosis}
        placeholder="Enter diagnosis"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      {/* Medicines */}
      <Text>Medicines (comma separated)</Text>
      <TextInput
        value={medicines}
        onChangeText={setMedicines}
        placeholder="e.g. Ashwagandha, Triphala"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      {/* Notes */}
      <Text>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional notes"
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 20,
          height: 80,
        }}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#1B5E20",
          padding: 15,
          borderRadius: 10,
        }}
        onPress={handleSave}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Save Prescription
        </Text>
      </TouchableOpacity>
    </View>
  );
}

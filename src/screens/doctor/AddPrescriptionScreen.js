import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AddPrescriptionScreen({ route, navigation }) {
  const { appointment } = route.params;

  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");

  const savePrescription = async () => {
    if (!diagnosis || !medicines) {
      Alert.alert("Please fill required fields");
      return;
    }

    try {
      await addDoc(collection(db, "prescriptions"), {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        diagnosis,
        medicines,
        notes,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Prescription Saved");
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Prescription for {appointment.patientName}
      </Text>

      <TextInput
        placeholder="Diagnosis"
        value={diagnosis}
        onChangeText={setDiagnosis}
        style={styles.input}
      />

      <TextInput
        placeholder="Medicines"
        value={medicines}
        onChangeText={setMedicines}
        style={styles.input}
        multiline
      />

      <TextInput
        placeholder="Notes (Optional)"
        value={notes}
        onChangeText={setNotes}
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={savePrescription}>
        <Text style={styles.buttonText}>Save Prescription</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8FAFB" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 20 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#0B8FAC",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

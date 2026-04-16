// src/screens/doctor/AddPrescriptionScreen.js
import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";

const PRESCRIPTION_TEMPLATES = [
  {
    key: "general",
    label: "General Wellness",
    diagnosis: "General wellness imbalance",
    notes:
      "Follow warm meals, fixed sleep time, and hydration. Continue light activity and review after 7 days.",
  },
  {
    key: "digestive",
    label: "Digestive Care",
    diagnosis: "Agnimandya (digestive weakness)",
    notes:
      "Avoid oily/spicy food, use warm water, and eat at fixed timings. Review after 10 days.",
  },
  {
    key: "stress",
    label: "Stress & Sleep",
    diagnosis: "Vata aggravation with stress symptoms",
    notes:
      "Do 10 minutes pranayama twice daily, avoid late-night screens, and maintain bedtime routine.",
  },
];

const createVerificationCode = (appointmentId = "", doctorId = "") =>
  `RX-${appointmentId.slice(0, 4).toUpperCase()}-${doctorId.slice(-4).toUpperCase()}-${Date.now()
    .toString()
    .slice(-5)}`;

const parseMedicineLines = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, dosage = "", frequency = "", days = ""] = line
        .split("|")
        .map((part) => part.trim());
      return {
        name,
        dosage,
        frequency,
        days,
      };
    })
    .filter((item) => item.name);

export default function AddPrescriptionScreen({ route, navigation }) {
  const { appointment } = route.params || {};
  const { user } = useContext(AuthContext);

  const [diagnosis, setDiagnosis] = useState("");
  const [medicineText, setMedicineText] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const applyTemplate = (templateKey) => {
    const template = PRESCRIPTION_TEMPLATES.find(
      (item) => item.key === templateKey,
    );
    if (!template) return;

    setSelectedTemplate(template.key);
    setDiagnosis((prev) => prev || template.diagnosis);
    setNotes((prev) => prev || template.notes);
  };

  const handleSave = async () => {
    if (!appointment) {
      Alert.alert("Error", "No appointment data");
      return;
    }

    const parsedMedicines = parseMedicineLines(medicineText);

    if (!diagnosis.trim() || parsedMedicines.length === 0) {
      Alert.alert("Error", "Please add diagnosis and at least one medicine");
      return;
    }

    try {
      await addDoc(collection(db, "prescriptions"), {
        doctorId: user.uid,
        doctorName:
          user.fullName || `${user.firstName || ""} ${user.lastName || ""}`,
        doctorSpecialization: user.specialization,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        appointmentId: appointment.id,
        diagnosis: diagnosis.trim(),
        medicines: parsedMedicines.map((item) => item.name).join(", "),
        medicinesStructured: parsedMedicines,
        notes: notes.trim(),
        templateUsed: selectedTemplate || "custom",
        verificationCode: createVerificationCode(appointment.id, user.uid),
        digitallySignedBy: user.uid,
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

      <Text>Quick Template</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 10,
          marginTop: 6,
        }}
      >
        {PRESCRIPTION_TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.key}
            style={{
              backgroundColor:
                selectedTemplate === template.key ? "#1B5E20" : "#E5E7EB",
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 14,
              marginRight: 8,
              marginBottom: 8,
            }}
            onPress={() => applyTemplate(template.key)}
          >
            <Text
              style={{
                color: selectedTemplate === template.key ? "#fff" : "#111827",
              }}
            >
              {template.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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

      <Text>Medicines (one per line: Name | Dosage | Frequency | Days)</Text>
      <TextInput
        value={medicineText}
        onChangeText={setMedicineText}
        placeholder={
          "Ashwagandha | 500 mg | After lunch | 7\nTriphala | 1 tab | Before sleep | 15"
        }
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
          minHeight: 110,
          textAlignVertical: "top",
        }}
      />

      <Text>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Diet/lifestyle advice, warnings, follow-up guidance"
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 20,
          height: 90,
          textAlignVertical: "top",
        }}
      />

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

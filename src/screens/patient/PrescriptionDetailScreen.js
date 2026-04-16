// src/screens/patient/PrescriptionDetailScreen.js
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { generatePrescriptionPDF } from "../../services/pdfService";

export default function PrescriptionDetailScreen({ route }) {
  const { prescription } = route.params;

  const medicinesStructured = Array.isArray(prescription.medicinesStructured)
    ? prescription.medicinesStructured
    : [];

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f5f5f5" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#1B5E20",
          marginBottom: 10,
        }}
      >
        Prescription Details
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          borderRadius: 15,
          marginBottom: 15,
          elevation: 2,
        }}
      >
        <Text style={{ color: "gray", marginTop: 5 }}>
          {prescription.doctorSpecialization || "Ayurvedic Specialist"}
        </Text>
        <Text style={{ color: "gray", marginTop: 5 }}>
          Date:{" "}
          {prescription.createdAt
            ? new Date(
                prescription.createdAt.seconds * 1000,
              ).toLocaleDateString()
            : ""}
        </Text>
        <Text style={{ color: "#1E3A8A", marginTop: 5, fontWeight: "600" }}>
          Verification ID: {prescription.verificationCode || "Not available"}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          borderRadius: 15,
          marginBottom: 15,
          elevation: 2,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Diagnosis</Text>
        <Text>{prescription.diagnosis}</Text>
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          borderRadius: 15,
          marginBottom: 15,
          elevation: 2,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Medicines</Text>
        {medicinesStructured.length > 0 ? (
          medicinesStructured.map((med, index) => (
            <View key={`${med.name}-${index}`} style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: "700" }}>• {med.name}</Text>
              {!!med.dosage && <Text>Dosage: {med.dosage}</Text>}
              {!!med.frequency && <Text>Frequency: {med.frequency}</Text>}
              {!!med.days && <Text>Duration: {med.days} days</Text>}
            </View>
          ))
        ) : prescription.medicines ? (
          prescription.medicines.split(",").map((med, index) => (
            <Text key={index} style={{ marginBottom: 5 }}>
              • {med.trim()}
            </Text>
          ))
        ) : (
          <Text>No medicines prescribed</Text>
        )}
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 15,
          borderRadius: 15,
          marginBottom: 20,
          elevation: 2,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Notes</Text>
        <Text>{prescription.notes || "No additional notes"}</Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#1B5E20",
          padding: 15,
          borderRadius: 12,
        }}
        onPress={() => generatePrescriptionPDF(prescription)}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Download PDF
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: "#2196F3",
          padding: 15,
          borderRadius: 12,
          marginTop: 10,
        }}
        onPress={() => generatePrescriptionPDF(prescription)}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Share Prescription
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

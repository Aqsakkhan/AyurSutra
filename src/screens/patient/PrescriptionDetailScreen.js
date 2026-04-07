import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { generatePrescriptionPDF } from "../../services/pdfService";

export default function PrescriptionDetailScreen({ route }) {
  const { prescription } = route.params;

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
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

      {/* Doctor Info */}
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
      </View>

      {/* Diagnosis */}
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

      {/* Medicines */}
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
        {prescription.medicines ? (
          prescription.medicines.split(",").map((med, index) => (
            <Text key={index} style={{ marginBottom: 5 }}>
              • {med.trim()}
            </Text>
          ))
        ) : (
          <Text>No medicines prescribed</Text>
        )}
      </View>

      {/* Notes */}
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
        <Text>{prescription.notes}</Text>
      </View>

      {/* Download Button */}
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

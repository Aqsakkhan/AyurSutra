import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";
import { generatePrescriptionPDF } from "../../services/pdfService";

export default function PrescriptionsScreen() {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const q = query(
        collection(db, "prescriptions"),
        where("appointmentId", "==", selectedAppointmentId),
      );

      const snapshot = await getDocs(q);

      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort latest first
      data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

      setPrescriptions(data);
    } catch (error) {
      console.log("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1, padding: 15, marginTop: 15 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", color: "#1B5E20" }}>
        Prescriptions
      </Text>

      {prescriptions.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "gray" }}>
            No prescriptions yet
          </Text>
          <Text style={{ fontSize: 12, color: "#aaa", marginTop: 5 }}>
            Your doctor will add prescriptions after consultation
          </Text>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            // ✅ CARD IS NOW CLICKABLE
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate("PrescriptionDetail", {
                  prescription: item,
                })
              }
              style={{
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 12,
                marginBottom: 10,
                elevation: 2,
              }}
            >
              <Text style={{ color: "gray", fontSize: 12 }}>
                {item.doctorSpecialization || "Ayurvedic Specialist"}
              </Text>

              <Text>Diagnosis: {item.diagnosis}</Text>

              <Text style={{ color: "gray", fontSize: 12 }}>
                {item.createdAt
                  ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                  : ""}
              </Text>

              {/* ✅ PDF BUTTON STILL WORKS */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#4CAF50",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
                onPress={() => generatePrescriptionPDF(item)}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Download PDF
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { setDoc, serverTimestamp } from "firebase/firestore";

export default function DoctorAppointmentDetailScreen({ route, navigation }) {
  const { appointment } = route.params;

  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  const updateStatus = async (newStatus) => {
    try {
      await updateDoc(doc(db, "appointments", appointment.id), {
        status: newStatus,
      });

      Alert.alert("Success", `Appointment ${newStatus}`);
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  const completeConsultation = async () => {
    if (!prescription) {
      Alert.alert("Prescription Required");
      return;
    }

    try {
      await updateDoc(doc(db, "appointments", appointment.id), {
        status: "completed",
        consultationNotes: notes,
        prescription: prescription,
      });

      Alert.alert("Consultation Completed");
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };
  const startCall = async () => {
    const callId = appointment.id;

    await setDoc(doc(db, "calls", callId), {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      channelName: appointment.id,
      status: "active",
      createdAt: serverTimestamp(),
    });

    navigation.navigate("VideoCall", {
      channelName: appointment.id,
    });
  };

  const appointmentDateTime = new Date(
    `${appointment.selectedDate}T${appointment.selectedTime}`,
  );
  const now = new Date();

  // 5 minutes before
  const startWindow = new Date(appointmentDateTime.getTime() - 5 * 60 * 1000);

  // 30 minutes after (optional limit)
  const endWindow = new Date(appointmentDateTime.getTime() + 30 * 60 * 1000);

  const isCallAllowed = now >= startWindow && now <= endWindow;

  const minutesLeft = Math.ceil((startWindow - now) / (60 * 1000));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Appointment Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Patient</Text>
        <Text style={styles.value}>{appointment.patientName}</Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{appointment.selectedDate}</Text>

        <Text style={styles.label}>Time</Text>
        <Text style={styles.value}>{appointment.selectedTime}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>{appointment.status}</Text>
      </View>

      {appointment.status === "pending" && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => updateStatus("accepted")}
          >
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => updateStatus("rejected")}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {appointment.status === "accepted" && (
        <>
          <Text style={styles.sectionTitle}>Consultation Notes</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Write consultation notes..."
            value={notes}
            onChangeText={setNotes}
          />
          <Text style={styles.sectionTitle}>Prescription</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Write prescription..."
            value={prescription}
            onChangeText={setPrescription}
          />
          {appointment?.status === "accepted" && (
            <>
              {/* 🔥 Start Video Call */}
              <TouchableOpacity
                disabled={!isCallAllowed}
                onPress={startCall}
                style={{
                  backgroundColor: isCallAllowed ? "#1B5E20" : "#ccc",
                  padding: 14,
                  borderRadius: 10,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  {isCallAllowed
                    ? "Start Video Call"
                    : `Available in ${minutesLeft > 0 ? minutesLeft : 0} min`}
                </Text>
              </TouchableOpacity>

              {/* 💊 Add Prescription */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#007bff",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 10,
                }}
                onPress={() =>
                  navigation.navigate("AddPrescription", { appointment })
                }
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Add Prescription
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={completeConsultation}
          >
            <Text style={styles.btnText}>Mark as Completed</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: "#777",
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
  },
  status: {
    marginTop: 4,
    fontWeight: "600",
    color: "#0B8FAC",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#C62828",
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
  },
  completeBtn: {
    backgroundColor: "#0B8FAC",
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
  },
  btnText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
});

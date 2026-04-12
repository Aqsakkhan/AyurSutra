import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebase";
import { setDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { scheduleNotification } from "../../services/notificationService";

export default function DoctorAppointmentsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );

      setAppointments(list);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateStatus = async (appointment, newStatus) => {
    try {
      await updateDoc(doc(db, "appointments", appointment.id), {
        status: newStatus,
      });

      if (newStatus === "accepted") {
        const patientDocId = `${appointment.doctorId}_${appointment.patientId}`;
        await scheduleNotification(
          "Appointment Confirmed",
          "Your appointment has been accepted by doctor",
          2, // 2 seconds (for testing)
        );

        await setDoc(
          doc(db, "doctorPatients", patientDocId),
          {
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            patientEmail: appointment.patientEmail || "",
            patientPhone: appointment.patientPhone || "",
            addedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      await addDoc(collection(db, "notifications"), {
        userId: appointment.patientId,
        title:
          newStatus === "accepted"
            ? "Appointment Accepted"
            : "Appointment Rejected",
        message:
          newStatus === "accepted"
            ? `Dr. ${appointment.doctorName} accepted your consultation.`
            : `Dr. ${appointment.doctorName} rejected your consultation.`,
        type: "appointment_update",
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("Update error:", error);
    }
  };
  const canStartConsultation = (appointment) => {
    if (!appointment.selectedDate || !appointment.selectedTime) return false;

    const appointmentDateTime = new Date(
      `${appointment.selectedDate} ${appointment.selectedTime}`,
    );

    const now = new Date();

    // allow start 10 minutes before time
    const tenMinutesBefore = new Date(
      appointmentDateTime.getTime() - 10 * 60000,
    );

    return now >= tenMinutesBefore && now <= appointmentDateTime;
  };
  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* 🔹 CLICKABLE AREA */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DoctorAppointmentDetail", {
              appointment: item,
            })
          }
        >
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text>Date: {item.selectedDate}</Text>
          <Text>Time: {item.selectedTime}</Text>
          <Text>Status: {item.status}</Text>
        </TouchableOpacity>

        {/* 🔹 ACTION BUTTONS */}
        {item.status === "pending" && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleUpdateStatus(item, "accepted")}
            >
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleUpdateStatus(item, "rejected")}
            >
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {appointments.length === 0 ? (
        <Text style={styles.empty}>No appointments yet</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    marginTop: 20,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    marginTop: 6,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  acceptBtn: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    width: 110,
    height: 45,
  },
  rejectBtn: {
    backgroundColor: "#C62828",
    padding: 10,
    borderRadius: 10,
    width: 110,
    height: 45,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
  },
});

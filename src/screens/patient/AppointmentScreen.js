import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AppointmentsScreen() {
  const { user } = useContext(AuthContext);

  const [consultations, setConsultations] = useState([]);
  const [therapyBookings, setTherapyBookings] = useState([]);

  useEffect(() => {
    fetchConsultations();
    fetchTherapyBookings();
  }, []);

  const fetchConsultations = async () => {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
    );

    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setConsultations(list);
  };

  const fetchTherapyBookings = async () => {
    const q = query(
      collection(db, "therapyBookings"),
      where("patientId", "==", user.uid),
    );

    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTherapyBookings(list);
  };

  const cancelTherapy = async (id) => {
    await updateDoc(doc(db, "therapyBookings", id), {
      status: "cancelled",
    });

    fetchTherapyBookings();
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return styles.pending;
      case "approved":
        return styles.approved;
      case "completed":
        return styles.completed;
      case "cancelled":
        return styles.cancelled;
      default:
        return styles.pending;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* CONSULTATIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consultations</Text>

        {consultations.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>Dr. {item.doctorName || "Doctor"}</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>
                {item.selectedDate || "Not selected"}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {item.selectedTime || "Not selected"}
              </Text>
            </View>

            <Text
              style={[
                styles.status,
                {
                  color:
                    item.status === "pending"
                      ? "#F9A825"
                      : item.status === "accepted"
                        ? "#2E7D32"
                        : "#C62828",
                },
              ]}
            >
              {item.status?.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      {/* THERAPY BOOKINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Therapy Bookings</Text>

        {therapyBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No therapy bookings yet</Text>
          </View>
        ) : (
          therapyBookings.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>{item.therapyName}</Text>
                <View style={getStatusStyle(item.status)}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.subText}>🏥 {item.centerName}</Text>

              <Text style={styles.subText}>
                📆{" "}
                {item.firstSessionDate
                  ? new Date(item.firstSessionDate).toDateString()
                  : "Not selected"}
              </Text>

              {item.status !== "cancelled" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => cancelTherapy(item.id)}
                >
                  <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
    padding: 20,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  title: {
    fontWeight: "600",
    fontSize: 15,
  },

  subText: {
    color: "#555",
    marginTop: 4,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    elevation: 2,
  },

  emptyText: {
    color: "#777",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  pending: {
    backgroundColor: "#FFF4E5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  approved: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  completed: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  cancelled: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
  },

  cancelText: {
    color: "#D32F2F",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },

  label: {
    width: 50,
    fontWeight: "500",
    color: "#666",
  },

  value: {
    color: "#333",
  },

  status: {
    marginTop: 6,
    fontWeight: "700",
  },
});

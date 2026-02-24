import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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

export default function MyAppointmentsScreen() {
  const { user } = useContext(AuthContext);

  const [consultations, setConsultations] = useState([]);
  const [therapyBookings, setTherapyBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const consultationQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
    );

    const therapyQuery = query(
      collection(db, "therapyBookings"),
      where("patientId", "==", user.uid),
    );

    const consultationSnap = await getDocs(consultationQuery);
    const therapySnap = await getDocs(therapyQuery);

    setConsultations(
      consultationSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    );

    setTherapyBookings(
      therapySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    );
  };

  const cancelTherapy = async (id) => {
    await updateDoc(doc(db, "therapyBookings", id), {
      status: "cancelled",
    });
    fetchData();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>🩺 Consultations</Text>

      {consultations.length === 0 ? (
        <Text style={styles.empty}>No consultations yet</Text>
      ) : (
        consultations.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>
              {item.date} - {item.timeSlot}
            </Text>
            <Text>Status: {item.status}</Text>
          </View>
        ))
      )}

      <Text style={styles.section}>🌿 Therapy Bookings</Text>

      {therapyBookings.length === 0 ? (
        <Text style={styles.empty}>No therapy bookings yet</Text>
      ) : (
        therapyBookings.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.therapyName}</Text>
            <Text>Center: {item.centerName}</Text>
            <Text>Status: {item.status}</Text>

            {item.status !== "cancelled" && (
              <TouchableOpacity onPress={() => cancelTherapy(item.id)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1EA",
    padding: 20,
  },

  section: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
  },
  cancel: {
    color: "red",
    marginTop: 5,
  },
  empty: {
    color: "#777",
  },
});

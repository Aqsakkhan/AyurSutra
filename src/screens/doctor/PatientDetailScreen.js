import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../services/firebase";

export default function PatientDetailScreen({ route }) {
  const { patientId } = route.params;

  const [patientInfo, setPatientInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientInfo();
    listenAppointments();
  }, []);

  const fetchPatientInfo = async () => {
    try {
      const docRef = doc(db, "users", patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPatientInfo(docSnap.data());
      }
    } catch (error) {
      console.log("Patient Info Error:", error);
    }
  };

  const listenAppointments = () => {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId),
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
      setLoading(false);
    });

    return unsubscribe;
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0B8FAC" />
      </View>
    );
  }

  const total = appointments.length;
  const accepted = appointments.filter(
    (item) => item.status === "accepted",
  ).length;
  const completed = appointments.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {patientInfo?.firstName?.charAt(0)?.toUpperCase() || "P"}
          </Text>
        </View>

        <Text style={styles.name}>
          {patientInfo?.firstName} {patientInfo?.lastName}
        </Text>

        <Text style={styles.info}>{patientInfo?.email}</Text>
        <Text style={styles.info}>{patientInfo?.phone}</Text>

        <Text style={styles.joined}>
          Joined:{" "}
          {patientInfo?.createdAt?.seconds
            ? new Date(patientInfo.createdAt.seconds * 1000).toDateString()
            : ""}
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <StatCard label="Total" value={total} />
        <StatCard label="Accepted" value={accepted} />
        <StatCard label="Completed" value={completed} />
      </View>

      {/* APPOINTMENT HISTORY */}
      <Text style={styles.sectionTitle}>Consultation History</Text>

      {appointments.length === 0 ? (
        <Text style={styles.empty}>No consultations yet</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.historyCard}>
              <Text style={styles.historyDate}>
                {item.selectedDate} - {item.selectedTime}
              </Text>

              <Text style={styles.historyStatus}>Status: {item.status}</Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const StatCard = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 20,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0B8FAC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  joined: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
  },

  historyDate: {
    fontWeight: "600",
  },

  historyStatus: {
    marginTop: 4,
    fontSize: 13,
    color: "#555",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

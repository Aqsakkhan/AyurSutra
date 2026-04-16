// src/screens/doctor/DoctorHomeScreen.js
import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const DoctorHomeScreen = () => {
  const { user, userData } = useContext(AuthContext);
  const navigation = useNavigation();

  const [appointments, setAppointments] = useState([]);
  const [therapyCount, setTherapyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (userData) {
      setIsAvailable(
        userData.isAvailable !== undefined ? userData.isAvailable : true,
      );
    }
  }, [userData]);

  const toggleAvailability = async () => {
    try {
      const newValue = !isAvailable;
      await updateDoc(doc(db, "users", user.uid), {
        isAvailable: newValue,
      });
      setIsAvailable(newValue);
    } catch (error) {
      console.log("Availability update error:", error);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const qAppointments = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid),
    );

    const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setAppointments(list);
      setLoading(false);
    });

    const qTherapies = query(
      collection(db, "therapyBookings"),
      where("doctorId", "==", user.uid),
    );

    const unsubscribeTherapies = onSnapshot(qTherapies, (snapshot) => {
      setTherapyCount(snapshot.size);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeTherapies();
    };
  }, [user]);

  const stats = useMemo(() => {
    const pending = appointments.filter(
      (item) => item.status === "pending",
    ).length;
    const completed = appointments.filter(
      (item) => item.status === "completed",
    ).length;

    const today = new Date().toDateString();
    const todaysAppointments = appointments.filter(
      (item) =>
        item.selectedDate &&
        new Date(item.selectedDate).toDateString() === today,
    );

    return {
      total: appointments.length,
      pending,
      completed,
      todaysAppointments,
    };
  }, [appointments]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0B8FAC" />
      </View>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.doctorName}>
                Dr.{" "}
                {`${userData?.firstName || ""} ${userData?.lastName || ""}`.trim()}
              </Text>
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.firstName?.charAt(0)?.toUpperCase() || "D"}
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isAvailable ? "#2E7D32" : "#C62828" },
                ]}
              />
              <Text style={styles.statusText}>
                {isAvailable ? "Available" : "On Leave"}
              </Text>
            </View>

            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ true: "#0B8FAC", false: "#ccc" }}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatCard label="Total Appointments" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Therapies" value={therapyCount} />
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Today's Activity</Text>
          {stats.todaysAppointments.length === 0 ? (
            <Text style={styles.emptyText}>No appointments for today.</Text>
          ) : (
            stats.todaysAppointments.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.activityRow}>
                <View>
                  <Text style={styles.activityName}>
                    {item.patientName || "Patient"}
                  </Text>
                  <Text style={styles.activityMeta}>
                    Time: {item.selectedTime || "N/A"}
                  </Text>
                </View>
                <Text style={styles.activityStatus}>
                  {item.status || "pending"}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("Chat", {
            aiMode: "doctor_assistant",
          })
        }
      >
        <Ionicons name="sparkles" size={22} color="#fff" />
        <Text style={styles.fabText}>AI</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const StatCard = ({ label, value }) => (
  <View style={styles.card}>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </View>
);

export default DoctorHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
    paddingHorizontal: 20,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 25,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
    color: "#111827",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#0B8FAC",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  cardLabel: {
    marginTop: 6,
    color: "#666",
    fontSize: 13,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 95,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  activityName: {
    fontWeight: "600",
    color: "#0F172A",
  },
  activityMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  activityStatus: {
    color: "#1D4ED8",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyText: {
    color: "#64748B",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B5E20",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 6,
  },
  fabText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

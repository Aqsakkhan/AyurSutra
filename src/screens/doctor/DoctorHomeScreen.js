import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
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

const DoctorHomeScreen = () => {
  const { user, userData } = useContext(AuthContext);

  const [totalAppointments, setTotalAppointments] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [therapyCount, setTherapyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  // 🔹 Sync availability from Firestore
  useEffect(() => {
    if (userData) {
      setIsAvailable(
        userData.isAvailable !== undefined ? userData.isAvailable : true,
      );
    }
  }, [userData]);

  // 🔹 Toggle availability
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

  // 🔹 Appointments + therapy listener
  useEffect(() => {
    if (!user?.uid) return;

    const qAppointments = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid),
    );

    const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
      let total = 0;
      let pending = 0;
      let completed = 0;

      snapshot.forEach((doc) => {
        total++;
        const data = doc.data();

        if (data.status === "pending") pending++;
        if (data.status === "completed") completed++;
      });

      setTotalAppointments(total);
      setPendingAppointments(pending);
      setCompletedAppointments(completed);
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
          <StatCard label="Total Appointments" value={totalAppointments} />
          <StatCard label="Pending" value={pendingAppointments} />
          <StatCard label="Completed" value={completedAppointments} />
          <StatCard label="Therapies Prescribed" value={therapyCount} />
        </View>
      </ScrollView>
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
    color: "#6B7280", // soft grey
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
  subtitle: {
    marginTop: 4,
    color: "#777",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  availabilityText: {
    marginRight: 10,
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

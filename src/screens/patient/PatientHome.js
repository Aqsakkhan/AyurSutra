import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { generatePrescriptionPDF } from "../../services/pdfService";

export default function PatientHome({ navigation }) {
  const { user, userData } = useContext(AuthContext);
  const [therapyBookings, setTherapyBookings] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalConsultations, setTotalConsultations] = useState(0);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);
  // Prescription
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "prescriptions"),
      where("patientId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPrescriptions(list);
    });

    return () => unsubscribe();
  }, [user]);
  // Appointments and Consultation
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔹 COUNT ONLY ACCEPTED
      const accepted = appointments.filter(
        (item) => item.status === "accepted",
      );
      setTotalConsultations(accepted.length);

      // 🔹 ACTIVE = PENDING OR ACCEPTED
      const active = appointments.filter(
        (appt) => appt.status === "pending" || appt.status === "accepted",
      );

      if (active.length > 0) {
        active.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
        );
        setActiveAppointment(active[0]);
      } else {
        setActiveAppointment(null);
      }
    });

    return () => unsubscribe();
  }, [user]);
  useEffect(() => {
    fetchAppointments();
    fetchTherapyBookings();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
    );

    const snapshot = await getDocs(q);
    setUnreadCount(snapshot.size);
  };

  const fetchTherapyBookings = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "therapyBookings"),
        where("patientId", "==", user.uid),
      );

      const snapshot = await getDocs(q);

      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort latest first
      bookings.sort(
        (a, b) =>
          new Date(b.createdAt?.seconds * 1000) -
          new Date(a.createdAt?.seconds * 1000),
      );

      setTherapyBookings(bookings);
    } catch (error) {
      console.log("FETCH THERAPY ERROR:", error);
    }
  };
  const cancelTherapyBooking = async (id) => {
    await updateDoc(doc(db, "therapyBookings", id), {
      status: "cancelled",
    });

    fetchTherapyBookings();
  };
  const fetchAppointments = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "appointments"),
        where("patientId", "==", user.uid),
      );

      const snapshot = await getDocs(q);

      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Count only ACCEPTED
      const accepted = appointments.filter(
        (item) => item.status === "accepted",
      );

      setTotalAppointments(accepted.length);
      // ✅ Filter last 3 days for recent activity
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const recentAppointments = appointments.filter((item) => {
        if (!item.createdAt?.seconds) return false;

        const createdDate = new Date(item.createdAt.seconds * 1000);
        return createdDate >= threeDaysAgo;
      });

      // Optional if you want to store separately
      setRecentAppointments(recentAppointments);

      // ✅ Active appointment (pending OR accepted)
      const active = appointments
        .filter(
          (item) => item.status === "pending" || item.status === "accepted",
        )
        .sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
        );

      setActiveAppointment(active.length > 0 ? active[0] : null);
    } catch (error) {
      console.log("FETCH APPOINTMENTS ERROR:", error);
    }
  };

  const firstLetter = userData?.firstName?.charAt(0).toUpperCase() || "?";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileLetter}>{firstLetter}</Text>
          </View>
        </TouchableOpacity>

        <View>
          <Text style={styles.greeting}>Hello, {userData?.firstName} 👋</Text>
        </View>

        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={26} color="#1B5E20" />
          </TouchableOpacity>

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* HEALTH SNAPSHOT */}
      <Text style={styles.sectionTitle}>Your Health Journey</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={22} color="#1B5E20" />
          <Text style={styles.statNumber}>{totalAppointments}</Text>
          <Text style={styles.statLabel}>Total Consultations</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="pulse-outline" size={22} color="#1B5E20" />
          <Text style={styles.statNumber}>{activeAppointment ? "1" : "0"}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Doctors")}
        >
          <Ionicons name="medkit-outline" size={26} color="#fff" />
          <Text style={styles.actionText}>Book Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Prescriptions")}
        >
          <Ionicons name="document-text-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>Prescriptions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Chat")}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>Ask AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Therapies")}
        >
          <Ionicons name="leaf-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>Book Therapy</Text>
        </TouchableOpacity>
      </View>

      {/* RECENT ACTIVITY */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>

      {/* Latest Consultation */}
      <View style={styles.activityCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>🩺 Consultation</Text>

          {activeAppointment?.status && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    activeAppointment.status === "pending"
                      ? "#FFF3CD"
                      : activeAppointment.status === "accepted"
                        ? "#E8F5E9"
                        : "#FFEBEE",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color:
                      activeAppointment.status === "pending"
                        ? "#F9A825"
                        : activeAppointment.status === "accepted"
                          ? "#2E7D32"
                          : "#C62828",
                  },
                ]}
              >
                {activeAppointment.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {activeAppointment ? (
          <>
            <Text style={styles.doctorNameText}>
              Dr. {activeAppointment.doctorName}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(activeAppointment.selectedDate).toDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>
                {activeAppointment.selectedTime}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No active consultations yet</Text>
        )}
      </View>

      {/* Latest Therapy Booking */}
      <View style={styles.activityCard}>
        <Text style={styles.activityHeader}>🌿 Therapy Booking</Text>

        {therapyBookings.length === 0 ? (
          <Text style={styles.activityText}>No therapy bookings yet</Text>
        ) : (
          <>
            <Text style={styles.activityTitle}>
              {therapyBookings[therapyBookings.length - 1].therapyName}
            </Text>

            <Text style={styles.activityText}>
              Center: {therapyBookings[therapyBookings.length - 1].centerName}
            </Text>

            <Text style={styles.activityText}>
              Status: {therapyBookings[therapyBookings.length - 1].status}
            </Text>

            <Text style={styles.activityText}>
              First Session:{" "}
              {new Date(
                therapyBookings[therapyBookings.length - 1].firstSessionDate,
              ).toDateString()}
            </Text>

            {therapyBookings[therapyBookings.length - 1].status !==
              "cancelled" && (
              <TouchableOpacity
                onPress={() =>
                  cancelTherapyBooking(
                    therapyBookings[therapyBookings.length - 1].id,
                  )
                }
              >
                <Text style={styles.cancelBtn}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1EA",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    marginTop: 15,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: "#1B5E20",
    justifyContent: "center",
    alignItems: "center",
  },
  profileLetter: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 13,
    color: "#555",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#1B5E20",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 15,
  },
  actionText: {
    color: "#fff",
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    elevation: 3,
  },

  activityHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  activityHeader: {
    fontSize: 14,
    fontWeight: "600",
  },

  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  activityText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 3,
  },

  statusText: {
    fontWeight: "700",
    marginTop: 4,
  },

  emptyText: {
    fontSize: 13,
    color: "#777",
  },

  cancelBtn: {
    marginTop: 8,
    color: "#C62828",
    fontWeight: "600",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  doctorNameText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  infoLabel: {
    width: 50,
    fontWeight: "500",
    color: "#666",
  },

  infoValue: {
    color: "#333",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

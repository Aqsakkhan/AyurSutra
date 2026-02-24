import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function DoctorsScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "doctor"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctorList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDoctors(doctorList);
    });

    return () => unsubscribe();
  }, []);

  const renderDoctor = ({ item }) => {
    const firstName = item.firstName || "";
    const lastName = item.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const isAvailable =
      item.isAvailable !== undefined ? item.isAvailable : true;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("AppointmentBooking", {
            doctor: item,
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstName ? firstName.charAt(0).toUpperCase() : "D"}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            Dr. {firstName} {lastName}
          </Text>

          <View style={styles.statusRow}>
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {doctors.length === 0 ? (
        <Text style={styles.empty}>No doctors available yet</Text>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctor}
          showsVerticalScrollIndicator={false}
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
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 3,
    alignItems: "center",
    marginTop: 20,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#0B8FAC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 18,
  },

  infoContainer: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
});

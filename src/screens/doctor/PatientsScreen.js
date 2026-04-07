import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";

const PatientsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "doctorPatients"),
      where("doctorId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatients(list);
    });

    return () => unsubscribe();
  }, [user]);

  const renderItem = ({ item }) => {
    const firstLetter = item.patientName?.charAt(0)?.toUpperCase() || "P";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("PatientDetail", {
            patient: item, // ✅ VERY IMPORTANT
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.patientName}</Text>

          {item.patientEmail ? (
            <Text style={styles.info}>{item.patientEmail}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {patients.length === 0 ? (
        <Text style={styles.empty}>No patients yet</Text>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default PatientsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
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
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "#0B8FAC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  info: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function TherapyCatalogScreen({ navigation }) {
  const [therapies, setTherapies] = useState([]);

  useEffect(() => {
    fetchTherapies();
  }, []);

  const fetchTherapies = async () => {
    const snapshot = await getDocs(collection(db, "therapyCatalog"));

    const therapyList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTherapies(therapyList);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (item.isActive === false) return;
        navigation.navigate("TherapyDetail", { therapy: item });
      }}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
      </View>

      <Text style={styles.desc}>{item.shortDescription}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.info}>{item.totalSessions} Sessions</Text>
        <Text style={styles.info}>Gap: {item.sessionGapDays} days</Text>
      </View>

      <Text style={styles.price}>₹ {item.cost}</Text>
      {!item.isActive && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveText}>Not Available</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🌿 Explore Therapies</Text>

      <FlatList
        data={therapies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1EA",
    padding: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1B5E20",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 22,
    marginBottom: 18,
    elevation: 5,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 17,
    fontWeight: "bold",
    flex: 1,
    paddingRight: 10,
  },

  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B5E20",
  },

  desc: {
    marginTop: 8,
    color: "#666",
    fontSize: 13,
    lineHeight: 20,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  info: {
    fontSize: 12,
    color: "#777",
  },

  price: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  inactiveBadge: {
    backgroundColor: "#FDECEA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  inactiveText: {
    fontSize: 12,
    color: "#C62828",
    fontWeight: "600",
  },
});

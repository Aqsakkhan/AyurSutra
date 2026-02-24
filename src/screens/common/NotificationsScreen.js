import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";

export default function NotificationsScreen() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id) => {
    await updateDoc(doc(db, "notifications", id), {
      read: true,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
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
    backgroundColor: "#F4F1EA",
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#1B5E20",
  },
  title: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    color: "#555",
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

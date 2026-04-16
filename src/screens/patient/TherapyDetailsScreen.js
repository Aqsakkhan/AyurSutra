// src/screens/patient/TherapyDetailsScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthContext";
import { createTherapyBookingWithPayment } from "../../services/appointmentService";

const THERAPY_PAYMENT_METHODS = [
  { key: "upi", label: "UPI" },
  { key: "card", label: "Card" },
  { key: "netbanking", label: "Net Banking" },
];

export default function TherapyDetailScreen({ route, navigation }) {
  const { therapy } = route.params;
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    await checkExistingBooking();
    await fetchLocationAndCenters();
  };

  const checkExistingBooking = async () => {
    const q = query(
      collection(db, "therapyBookings"),
      where("patientId", "==", user.uid),
      where("therapyId", "==", therapy.id),
      where("status", "in", [
        "confirmed",
        "pending_confirmation",
        "awaiting_consultation",
      ]),
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setExistingBooking({
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      });
    }
  };

  const fetchLocationAndCenters = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Location permission denied");
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userCoords = location.coords;

      const snapshot = await getDocs(collection(db, "centers"));
      let centerList = snapshot.docs
        .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
        .filter((c) => c.isActive);

      centerList = centerList.map((center) => {
        if (center.latitude && center.longitude) {
          center.distance = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            center.latitude,
            center.longitude,
          );
        }
        return center;
      });

      centerList.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setCenters(centerList);
    } catch (error) {
      console.log("Location error:", error);
    }

    setLocationLoading(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const generateSchedule = (startDate) => {
    const sessions = [];
    for (let i = 0; i < therapy.totalSessions; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(nextDate.getDate() + i * therapy.sessionGapDays);
      sessions.push(nextDate);
    }
    return sessions;
  };

  const handleBooking = async () => {
    if (therapy.consultationRequired && !prescriptionUploaded) {
      Alert.alert(
        "Prescription Required",
        "This therapy requires doctor consultation. Please upload prescription first.",
      );
      return;
    }

    if (!selectedDate || !selectedCenter) {
      Alert.alert("Error", "Please select date and center");
      return;
    }

    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      setLoading(true);

      await createTherapyBookingWithPayment({
        therapy,
        user,
        selectedCenter,
        selectedDate,
        consultationRequired: therapy?.consultationRequired,
        paymentMethod,
        schedule,
      });

      Alert.alert("Success", "Booking submitted successfully");
      navigation.navigate("Home");
    } catch (error) {
      console.log("BOOKING ERROR:", error);
      Alert.alert("Booking Failed", error.message);
    }

    setLoading(false);
  };

  const cancelBooking = async () => {
    setLoading(true);
    await updateDoc(doc(db, "therapyBookings", existingBooking.id), {
      status: "cancelled",
    });

    setExistingBooking(null);
    Alert.alert("Cancelled successfully");
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.title}>{therapy?.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{therapy?.category}</Text>
          </View>
        </View>
        <Text style={styles.description}>{therapy?.shortDescription}</Text>
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Program Cost</Text>
          <Text style={styles.price}>₹ {therapy?.cost}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌿 Overview</Text>
        <Text style={styles.text}>{therapy?.overview}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>✨ Benefits</Text>
        {therapy?.benefits?.map((item, index) => (
          <Text key={index} style={styles.benefit}>
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📋 Program Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Sessions</Text>
          <Text style={styles.value}>{therapy?.totalSessions}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gap</Text>
          <Text style={styles.value}>{therapy?.sessionGapDays} days</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Duration</Text>
          <Text style={styles.value}>{therapy?.totalDurationDays} days</Text>
        </View>
      </View>

      {therapy.consultationRequired && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            Doctor consultation required before confirmation.
          </Text>
        </View>
      )}

      {therapy.consultationRequired && (
        <TouchableOpacity
          style={styles.prescriptionBtn}
          onPress={() => {
            setPrescriptionUploaded(true);
            Alert.alert(
              "Prescription Added",
              "Prescription verified successfully.",
            );
          }}
        >
          <Text style={{ color: "#fff" }}>Upload Prescription</Text>
        </TouchableOpacity>
      )}

      {existingBooking ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            Current Status: {existingBooking.status}
          </Text>

          {existingBooking.status !== "cancelled" && (
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelBooking}>
              <Text style={{ color: "#fff" }}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowPicker(true)}
          >
            <Text style={{ color: "#fff" }}>Select First Session Date</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(e, date) => {
                setShowPicker(false);
                if (date) {
                  setSelectedDate(date);
                  setSchedule(generateSchedule(date));
                }
              }}
            />
          )}

          {selectedDate && (
            <Text style={styles.selectedDate}>
              {selectedDate.toDateString()}
            </Text>
          )}

          {schedule.length > 0 && (
            <View style={styles.card}>
              {schedule.map((d, i) => (
                <Text key={i}>
                  Session {i + 1}: {d.toDateString()}
                </Text>
              ))}
            </View>
          )}

          {locationLoading ? (
            <ActivityIndicator size="large" color="#1B5E20" />
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Nearby Centers</Text>

              {centers.map((center) => (
                <TouchableOpacity
                  key={center.id}
                  style={[
                    styles.centerCard,
                    selectedCenter?.id === center.id && styles.selectedCenter,
                  ]}
                  onPress={() => setSelectedCenter(center)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.centerName}>{center.name}</Text>
                    <Text style={styles.centerAddress}>{center.address}</Text>
                    {center.distance && (
                      <Text style={styles.distance}>
                        {center.distance.toFixed(2)} km
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${center.phone}`)}
                  >
                    <Text style={styles.call}>Call</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentRow}>
              {THERAPY_PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    styles.paymentChip,
                    paymentMethod === method.key && styles.paymentChipSelected,
                  ]}
                  onPress={() => setPaymentMethod(method.key)}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      paymentMethod === method.key &&
                        styles.paymentTextSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.summaryText}>
              Total to pay now: ₹ {therapy?.cost || 0}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.bookBtn,
              (!selectedDate || !selectedCenter) && styles.disabledBtn,
            ]}
            disabled={!selectedDate || !selectedCenter}
            onPress={handleBooking}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff" }}>Pay & Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F1EA", padding: 20 },
  hero: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 6,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
    flex: 1,
    paddingRight: 10,
  },
  description: { marginTop: 12, fontSize: 14, color: "#666", lineHeight: 22 },
  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#1B5E20" },
  priceBox: {
    marginTop: 18,
    backgroundColor: "#F1F8E9",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  priceLabel: { fontSize: 13, color: "#666" },
  price: { fontSize: 22, fontWeight: "bold", color: "#1B5E20", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
  },
  sectionTitle: { fontWeight: "bold", marginBottom: 6 },
  text: { fontSize: 14, color: "#555", lineHeight: 22 },
  benefit: { fontSize: 14, color: "#444", marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#666" },
  value: { fontWeight: "600", color: "#1B5E20" },
  warning: {
    backgroundColor: "#FFF3CD",
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
  },
  warningText: { color: "#856404" },
  statusBox: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
  },
  statusText: { fontWeight: "600", color: "#1B5E20" },
  cancelBtn: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  dateBtn: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 10,
  },
  selectedDate: { fontWeight: "600", color: "#1B5E20", marginBottom: 10 },
  centerCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  selectedCenter: {
    borderWidth: 1,
    borderColor: "#1B5E20",
    backgroundColor: "#E8F5E9",
  },
  centerName: { fontWeight: "600" },
  centerAddress: { fontSize: 12, color: "#666" },
  distance: { fontSize: 12, color: "#1B5E20" },
  call: { color: "#1B5E20", fontWeight: "600" },
  bookBtn: {
    backgroundColor: "#1B5E20",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  disabledBtn: { opacity: 0.5 },
  prescriptionBtn: {
    backgroundColor: "#8E24AA",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  paymentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  paymentChip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  paymentChipSelected: {
    backgroundColor: "#1B5E20",
  },
  paymentText: {
    color: "#1E293B",
    fontWeight: "600",
  },
  paymentTextSelected: {
    color: "#fff",
  },
  summaryText: {
    color: "#334155",
    fontWeight: "600",
  },
});

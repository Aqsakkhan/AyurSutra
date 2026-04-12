import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AppointmentBookingScreen({ route, navigation }) {
  const { doctor } = route.params;
  const { user, userData } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const checkSlotAvailability = async (doctorId, date, time) => {
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId),
      where("selectedDate", "==", date),
      where("selectedTime", "==", time),
      where("status", "in", ["pending", "accepted"]),
    );

    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  // ❌ Check past time
  const isPastTime = (selectedDate, selectedTime) => {
    const now = new Date();

    const [time, modifier] = selectedTime.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") hours = parseInt(hours) + 12;
    if (modifier === "AM" && hours === "12") hours = 0;

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours);
    selectedDateTime.setMinutes(minutes);

    return selectedDateTime < now; // ✅ FIXED (no "snow")
  };

  const generateNext7Days = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);

      const day = nextDate.getDay();

      if (day !== 0) {
        // ❌ Skip Sunday
        dates.push(nextDate);
      }
    }

    return dates;
  };

  const availableDates = generateNext7Days();
  const availableTimes = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "4.00 PM",
    "5.00 PM",
    "8.45 PM",
  ];

  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Please select date and time");
      return;
    }

    if (!doctor.isAvailable) {
      Alert.alert("Doctor is currently on leave");
      return;
    }
    const isAvailable = await checkSlotAvailability(
      doctor.id,
      selectedDate,
      selectedTime,
    );

    if (!isAvailable) {
      Alert.alert("Slot already booked");
      return;
    }
    const day = new Date(selectedDate).getDay();
    if (day === 0) {
      Alert.alert("Doctor is not available on Sundays");
      return;
    }

    // ❌ Prevent past time
    if (isPastTime(selectedDate, selectedTime)) {
      Alert.alert("Cannot book past time slots");
      return;
    }

    try {
      await addDoc(collection(db, "appointments"), {
        doctorId: doctor.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        patientId: user.uid,
        patientName: `${userData.firstName} ${userData.lastName}`,
        selectedDate,
        selectedTime,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Appointment Request Sent");
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Doctor Header */}
      <View style={styles.headerCard}>
        <Text style={styles.doctorName}>
          Dr. {doctor.firstName} {doctor.lastName}
        </Text>
        <Text style={styles.specialText}>
          {doctor.isAvailable ? "Available Today" : "Currently On Leave"}
        </Text>
      </View>

      {/* Date Selection */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <View style={styles.optionRow}>
        {availableDates.map((date, index) => {
          const formatted = date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

          const dateString = date.toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                selectedDate === dateString && styles.selectedOption,
              ]}
              onPress={() => setSelectedDate(dateString)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedDate === dateString && styles.selectedText,
                ]}
              >
                {formatted}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time Selection */}
      <Text style={styles.sectionTitle}>Select Time</Text>
      <View style={styles.optionRow}>
        {availableTimes.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.optionCard,
              selectedTime === time && styles.selectedOption,
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text
              style={[
                styles.optionText,
                selectedTime === time && styles.selectedText,
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.button} onPress={bookAppointment}>
        <Text style={styles.buttonText}>Confirm Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
    padding: 20,
    paddingTop: 40,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 18,
    elevation: 3,
    marginBottom: 30,
  },

  doctorName: {
    fontSize: 20,
    fontWeight: "700",
  },

  specialText: {
    marginTop: 6,
    color: "#666",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    elevation: 2,
  },

  selectedOption: {
    backgroundColor: "#0B8FAC",
  },

  optionText: {
    fontSize: 13,
  },

  selectedText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  button: {
    marginTop: 30,
    backgroundColor: "#0B8FAC",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});

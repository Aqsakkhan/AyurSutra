import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import {
  checkSlotAvailability,
  createAppointmentWithPayment,
} from "../../services/appointmentService";

const PAYMENT_METHODS = [
  { key: "upi", label: "UPI" },
  { key: "card", label: "Card" },
  { key: "netbanking", label: "Net Banking" },
  { key: "wallet", label: "Wallet" },
];

export default function AppointmentBookingScreen({ route, navigation }) {
  const { doctor } = route.params;
  const { user, userData } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const consultationFee = Number(doctor?.consultationFee || doctor?.fee || 499);

  const isPastTime = (pickedDate, pickedTime) => {
    const now = new Date();
    const [time, modifier] = pickedTime.split(" ");
    const [rawHours, rawMinutes] = time.split(":");

    let hours = Number(rawHours);
    const minutes = Number(rawMinutes);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const selectedDateTime = new Date(pickedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    return selectedDateTime < now;
  };

  const generateNext10WorkingDays = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i += 1) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      if (nextDate.getDay() !== 0) {
        dates.push(nextDate);
      }
      if (dates.length === 10) break;
    }

    return dates;
  };

  const availableDates = generateNext10WorkingDays();
  const availableTimes = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "4:00 PM",
    "5:00 PM",
    "8:45 PM",
  ];

  const bookAppointment = async () => {
    if (isSubmitting) return;

    if (!selectedDate || !selectedTime) {
      Alert.alert("Please select date and time");
      return;
    }

    if (!doctor?.isAvailable) {
      Alert.alert("Doctor is currently on leave");
      return;
    }

    if (isPastTime(selectedDate, selectedTime)) {
      Alert.alert("Cannot book past time slots");
      return;
    }

    try {
      setIsSubmitting(true);

      const slotFree = await checkSlotAvailability(
        doctor.id,
        selectedDate,
        selectedTime,
      );

      if (!slotFree) {
        Alert.alert("Slot already booked", "Please pick another date/time.");
        return;
      }

      await createAppointmentWithPayment({
        doctor,
        user,
        userData,
        selectedDate,
        selectedTime,
        paymentMethod,
      });

      Alert.alert(
        "Booked Successfully",
        "Appointment request and payment were recorded.",
      );
      navigation.goBack();
    } catch (error) {
      console.log("Book appointment error", error);
      Alert.alert("Booking Failed", "Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.doctorName}>
          Dr. {doctor.firstName} {doctor.lastName}
        </Text>
        <Text style={styles.specialText}>
          {doctor.isAvailable ? "Available Today" : "Currently On Leave"}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Select Date</Text>
      <View style={styles.optionRow}>
        {availableDates.map((date) => {
          const formatted = date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const dateString = date.toDateString();

          return (
            <TouchableOpacity
              key={dateString}
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

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.optionRow}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.optionCard,
              paymentMethod === method.key && styles.selectedOption,
            ]}
            onPress={() => setPaymentMethod(method.key)}
          >
            <Text
              style={[
                styles.optionText,
                paymentMethod === method.key && styles.selectedText,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Consultation Summary</Text>
        <Text style={styles.summaryLine}>Doctor: Dr. {doctor.firstName}</Text>
        <Text style={styles.summaryLine}>Fee: ₹{consultationFee}</Text>
        <Text style={styles.summaryLine}>
          Payment:{" "}
          {PAYMENT_METHODS.find((item) => item.key === paymentMethod)?.label}
        </Text>
        <Text style={styles.summaryNote}>
          Demo mode: payment is stored as a successful transaction in Firestore.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={bookAppointment}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Processing..." : "Pay & Confirm Appointment"}
        </Text>
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
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: "#1B5E20",
  },
  optionText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
  },
  summaryTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  summaryLine: {
    color: "#334155",
    marginBottom: 4,
  },
  summaryNote: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#1B5E20",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

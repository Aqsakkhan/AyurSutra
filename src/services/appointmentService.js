// src/services/appointmentService.js
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export const checkSlotAvailability = async (doctorId, date, time) => {
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

const buildTransactionId = () =>
  `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

export const createAppointmentWithPayment = async ({
  doctor,
  user,
  userData,
  selectedDate,
  selectedTime,
  paymentMethod,
}) => {
  const consultationFee = Number(doctor?.consultationFee || doctor?.fee || 499);

  const paymentRef = await addDoc(collection(db, "payments"), {
    patientId: user.uid,
    patientName:
      `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
    doctorId: doctor.id,
    doctorName: `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim(),
    amount: consultationFee,
    currency: "INR",
    method: paymentMethod,
    status: "success",
    transactionId: buildTransactionId(),
    createdAt: serverTimestamp(),
  });

  const appointmentRef = await addDoc(collection(db, "appointments"), {
    doctorId: doctor.id,
    doctorName: `${doctor.firstName} ${doctor.lastName}`,
    patientId: user.uid,
    patientName: `${userData.firstName} ${userData.lastName}`,
    selectedDate,
    selectedTime,
    status: "pending",
    consultationFee,
    paymentId: paymentRef.id,
    paymentMethod,
    paymentStatus: "paid",
    createdAt: serverTimestamp(),
  });

  return { appointmentId: appointmentRef.id, paymentId: paymentRef.id };
};

export const createTherapyBookingWithPayment = async ({
  therapy,
  user,
  selectedCenter,
  selectedDate,
  consultationRequired,
  paymentMethod,
  schedule,
}) => {
  const amount = Number(therapy?.cost || 0);

  const paymentRef = await addDoc(collection(db, "payments"), {
    patientId: user.uid,
    patientName: user.fullName || user.displayName || "Patient",
    therapyId: therapy?.id || "",
    therapyName: therapy?.name || "Therapy",
    amount,
    currency: "INR",
    method: paymentMethod,
    status: "success",
    transactionId: buildTransactionId(),
    paymentFor: "therapy_booking",
    createdAt: serverTimestamp(),
  });

  const bookingRef = await addDoc(collection(db, "therapyBookings"), {
    patientId: user.uid,
    therapyId: therapy?.id || "unknown",
    therapyName: therapy?.name || "Therapy",
    centerId: selectedCenter.id,
    centerName: selectedCenter.name,
    centerAddress: selectedCenter.address,
    firstSessionDate: selectedDate.toISOString(),
    sessionSchedule: Array.isArray(schedule)
      ? schedule.map((d) => d.toISOString())
      : [],
    consultationRequired: consultationRequired || false,
    status: consultationRequired ? "awaiting_prescription" : "confirmed",
    paymentId: paymentRef.id,
    paymentMethod,
    paymentStatus: "paid",
    amountPaid: amount,
    createdAt: serverTimestamp(),
  });

  return { bookingId: bookingRef.id, paymentId: paymentRef.id };
};

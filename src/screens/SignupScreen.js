import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");

  // 🔹 FORM VALIDATION
  const validateForm = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "All fields are required");
      return false;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      Alert.alert("Error", "Phone number must be 10 digits");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  // 🔹 HANDLE SIGNUP
  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const firebaseUser = userCredential.user;

      const userData = {
        uid: firebaseUser.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        specialization: role === "doctor" ? specialization?.trim() : "",
        experience: role === "doctor" ? experience?.trim() : "",
        createdAt: serverTimestamp(),
      };

      // Save in users collection
      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      // Save phone mapping
      await setDoc(doc(db, "phoneNumbers", phone.trim()), {
        uid: firebaseUser.uid,
      });

      Alert.alert("Success", "Account created successfully");
      navigation.navigate("Login");
    } catch (error) {
      console.log("Signup Error:", error);
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create AyurSutra Account 🌿</Text>

      {/* FIRST NAME */}
      <TextInput
        placeholder="First Name"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      {/* LAST NAME */}
      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      {/* PHONE */}
      <TextInput
        placeholder="Phone Number"
        keyboardType="numeric"
        maxLength={10}
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* PASSWORD */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {/* CONFIRM PASSWORD */}
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {role === "doctor" && (
        <>
          <TextInput
            placeholder="Specialization"
            style={styles.input}
            value={specialization}
            onChangeText={setSpecialization}
          />

          <TextInput
            placeholder="Experience (Years)"
            style={styles.input}
            keyboardType="numeric"
            value={experience}
            onChangeText={setExperience}
          />
        </>
      )}

      {/* ROLE SELECTOR */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "patient" && styles.activeRole]}
          onPress={() => setRole("patient")}
        >
          <Text style={styles.roleText}>Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "doctor" && styles.activeRole]}
          onPress={() => setRole("doctor")}
        >
          <Text style={styles.roleText}>Doctor</Text>
        </TouchableOpacity>
      </View>

      {/* SIGNUP BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* LOGIN LINK */}
      <TouchableOpacity
        style={{ marginTop: 20, alignItems: "center" }}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Text style={styles.linkHighlight}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F1EA",
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 25,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  roleButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
    borderRadius: 12,
    alignItems: "center",
  },

  activeRole: {
    backgroundColor: "#A5D6A7",
  },

  roleText: {
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  linkText: {
    color: "#555",
    fontSize: 14,
  },

  linkHighlight: {
    color: "#1B5E20",
    fontWeight: "bold",
  },
});

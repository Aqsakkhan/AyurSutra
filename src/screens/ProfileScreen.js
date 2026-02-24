import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const { user, userData, logout } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setPhone(userData.phone || "");
      setSpecialization(userData.specialization || "");
      setExperience(userData.experience || "");
    }
  }, [userData]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        phone,
        specialization,
        experience,
      });

      Alert.alert("Success", "Profile updated successfully");
      setEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const firstLetter = firstName?.charAt(0)?.toUpperCase() || "?";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>

        <Text style={styles.fullName}>
          {firstName} {lastName}
        </Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{userData?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* ACCOUNT CARD */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={[styles.input, !editing && styles.disabled]}
          value={firstName}
          editable={editing}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={[styles.input, !editing && styles.disabled]}
          value={lastName}
          editable={editing}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabled]}
          value={user?.email}
          editable={false}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={[styles.input, !editing && styles.disabled]}
          value={phone}
          editable={editing}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />

        {userData?.role === "doctor" && (
          <>
            <Text style={styles.label}>Specialization</Text>
            <TextInput
              style={[styles.input, !editing && styles.disabled]}
              value={specialization}
              editable={editing}
              onChangeText={setSpecialization}
            />

            <Text style={styles.label}>Experience (Years)</Text>
            <TextInput
              style={[styles.input, !editing && styles.disabled]}
              value={experience}
              editable={editing}
              keyboardType="numeric"
              onChangeText={setExperience}
            />
          </>
        )}

        {!editing ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* APP SECTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>More</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("About")}
        >
          <Ionicons name="information-circle-outline" size={20} />
          <Text style={styles.optionText}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("Contact")}
        >
          <Ionicons name="mail-outline" size={20} />
          <Text style={styles.optionText}>Contact Us</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
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
    alignItems: "center",
    marginVertical: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#1B5E20",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "bold",
  },

  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  roleBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },

  roleText: {
    fontSize: 12,
    color: "#1B5E20",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    elevation: 3,
    marginBottom: 18,
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#777",
    marginTop: 8,
  },

  input: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
  },

  disabled: {
    backgroundColor: "#eee",
  },

  editBtn: {
    marginTop: 15,
    backgroundColor: "#1B5E20",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  saveBtn: {
    marginTop: 15,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  optionText: {
    marginLeft: 10,
    fontSize: 14,
  },

  logoutBtn: {
    backgroundColor: "#C62828",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
});

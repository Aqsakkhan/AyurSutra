import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LandingScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.logo}>AyurSutra 🌿</Text>
          <Text style={styles.tagline}>AI-Powered Ayurvedic Wellness</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* FEATURES GRID */}
        <View style={styles.features}>
          <View style={styles.featureCard}>
            <Ionicons name="leaf" size={28} color="#1B5E20" />
            <Text style={styles.featureTitle}>Natural Healing</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="heart" size={28} color="#1B5E20" />
            <Text style={styles.featureTitle}>Holistic Care</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="mic" size={28} color="#1B5E20" />
            <Text style={styles.featureTitle}>Voice Support</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="chatbubble" size={28} color="#1B5E20" />
            <Text style={styles.featureTitle}>AI Assistant</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FLOATING CHAT BUTTON */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("Chat")}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1EA",
    paddingHorizontal: 25,
  },

  hero: {
    marginTop: 100,
    alignItems: "center",
    marginBottom: 60,
  },

  logo: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  tagline: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
  },

  primaryButton: {
    marginTop: 25,
    backgroundColor: "#1B5E20",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 50,
  },

  featureCard: {
    width: "47%",
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },

  featureTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  whySection: {
    marginBottom: 40,
  },

  whyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 20,
  },

  whyCard: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    borderRadius: 20,
  },

  whyText: {
    fontSize: 14,
    marginBottom: 10,
    color: "#444",
  },

  chatButton: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#1B5E20",
    padding: 18,
    borderRadius: 50,
    elevation: 5,
  },
});

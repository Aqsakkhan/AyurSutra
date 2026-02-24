import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HERO SECTION */}
      <View style={styles.hero}>
        <Text style={styles.brand}>AyurSutra 🌿</Text>
        <Text style={styles.tagline}>Ancient Wisdom. Modern Healing.</Text>
      </View>

      {/* INTRO */}
      <View style={styles.card}>
        <Text style={styles.heading}>Who We Are</Text>
        <Text style={styles.text}>
          AyurSutra is an AI-powered Ayurvedic wellness platform designed to
          bridge traditional Ayurvedic practices with modern technology. We
          connect patients with certified doctors and trusted therapy centers,
          both online and offline.
        </Text>
      </View>

      {/* WHY AYURVEDA */}
      <View style={styles.card}>
        <Text style={styles.heading}>Why Ayurveda?</Text>
        <Text style={styles.text}>
          Ayurveda is a 5000-year-old holistic healing system focused on
          balancing mind, body, and soul. Instead of treating symptoms, Ayurveda
          addresses the root cause of illness.
        </Text>
      </View>

      {/* WHAT WE OFFER */}
      <View style={styles.card}>
        <Text style={styles.heading}>What We Offer</Text>

        <Text style={styles.bullet}>• Online Doctor Consultations</Text>
        <Text style={styles.bullet}>• Offline Therapy Booking</Text>
        <Text style={styles.bullet}>• Nearby Ayurvedic Centers</Text>
        <Text style={styles.bullet}>• AI Health Assistant</Text>
        <Text style={styles.bullet}>• Personalized Therapy Plans</Text>
      </View>

      {/* ONLINE + OFFLINE MODEL */}
      <View style={styles.card}>
        <Text style={styles.heading}>Integrated Healing Model</Text>
        <Text style={styles.text}>
          AyurSutra combines online consultations with offline therapy sessions
          at certified centers. This ensures complete treatment support from
          diagnosis to recovery.
        </Text>
      </View>

      {/* AI VISION */}
      <View style={styles.card}>
        <Text style={styles.heading}>AI Support Vision</Text>
        <Text style={styles.text}>
          Our intelligent AI assistant helps patients understand symptoms,
          explore therapies, and make informed wellness decisions — bringing
          personalized care to everyone.
        </Text>
      </View>

      {/* MISSION */}
      <View style={styles.missionBox}>
        <Text style={styles.missionText}>
          “To make authentic Ayurvedic healing accessible, affordable, and
          intelligent for everyone.”
        </Text>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F1EA",
    paddingHorizontal: 20,
  },

  hero: {
    marginTop: 25,
    marginBottom: 30,
    alignItems: "center",
  },

  brand: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  tagline: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 4,
  },

  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1B5E20",
  },

  text: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },

  bullet: {
    fontSize: 13,
    marginBottom: 6,
    color: "#444",
  },

  missionBox: {
    backgroundColor: "#1B5E20",
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
  },

  missionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});

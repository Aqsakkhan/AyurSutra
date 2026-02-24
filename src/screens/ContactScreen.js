import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ContactScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text>Email support coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

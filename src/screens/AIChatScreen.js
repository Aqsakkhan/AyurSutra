import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text:
        "🌿 Welcome to AyurSutra AI\n\n" +
        "AyurSutra is an AI-powered wellness assistant that combines the ancient science of Ayurveda with modern intelligence.\n\n" +
        "It helps you:\n" +
        "• Understand your Dosha (Vata, Pitta, Kapha)\n" +
        "• Identify possible imbalances\n" +
        "• Receive natural lifestyle guidance\n" +
        "• Discover root-cause healing solutions\n\n" +
        "Ask me anything about your health.",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // More Natural Response Logic
  const generateResponse = (text) => {
    const lower = text.toLowerCase();

    // Health-related
    if (lower.includes("head") || lower.includes("sir")) {
      return "Headache may relate to Vata imbalance.\n\nTry:\n• Proper hydration\n• Oil massage\n• Rest\n\nIf pain continues, consult a doctor.";
    }

    if (lower.includes("stress") || lower.includes("tension")) {
      return "Stress often indicates Vata disturbance.\n\nRecommended:\n• Deep breathing\n• Meditation\n• Warm meals\n• Early sleep";
    }

    if (lower.includes("digestion") || lower.includes("pet")) {
      return "Digestive discomfort may relate to Pitta imbalance.\n\nTry:\n• Avoid spicy food\n• Drink warm water\n• Eat on time";
    }

    // About Ayurveda
    if (lower.includes("ayurveda")) {
      return "Ayurveda is a 5000-year-old natural healing system.\n\nIt focuses on balancing Vata, Pitta, and Kapha to maintain overall health.";
    }

    // Default intelligent response
    return "Thank you for your question 🌿\n\nFor better guidance, please describe:\n• Your symptoms\n• Since when\n• Any lifestyle habits\n\nI will try to guide you naturally.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(input),
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    }, 900);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1EA" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>AyurSutra AI</Text>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.sender === "user" ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text
                style={
                  item.sender === "user" ? { color: "#fff" } : { color: "#000" }
                }
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        {loading && (
          <View style={{ paddingLeft: 20 }}>
            <ActivityIndicator size="small" color="#1B5E20" />
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your question..."
            value={input}
            onChangeText={setInput}
            style={styles.input}
          />

          {/* Mic Button (UI only for now) */}
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 18,
    backgroundColor: "#1B5E20",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  message: {
    padding: 15,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "75%",
  },

  userMessage: {
    backgroundColor: "#1B5E20",
    alignSelf: "flex-end",
  },

  botMessage: {
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 25,
  },

  micButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    marginLeft: 8,
    borderRadius: 25,
  },

  sendButton: {
    backgroundColor: "#1B5E20",
    padding: 12,
    marginLeft: 8,
    borderRadius: 25,
  },
});

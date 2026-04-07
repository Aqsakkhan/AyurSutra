import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { requestNotificationPermission } from "./src/services/notificationService";

export default function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

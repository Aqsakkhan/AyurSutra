import * as Notifications from "expo-notifications";

// Ask permission
export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

// Schedule reminder
export const scheduleNotification = async (title, body, seconds) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: "timeInterval",
      seconds: seconds,
      repeats: false,
    },
  });
};

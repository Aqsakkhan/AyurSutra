# AyurSutra Mobile

AyurSutra is a React Native + Expo mobile app for Ayurvedic healthcare workflows. It supports patient and doctor experiences including appointments, prescriptions, therapy booking, AI chat assistance, notifications, and video calling.

## Tech Stack

- **Framework**: React Native (0.81) with Expo SDK 54
- **Language**: JavaScript (React)
- **Navigation**: React Navigation (native stack + tabs)
- **Backend**: Firebase
  - Authentication (`firebase/auth`)
  - Firestore (`firebase/firestore`)
- **Key native/device features**:
  - Agora video calling (`react-native-agora`)
  - Location (`expo-location`)
  - Notifications (`expo-notifications`)
  - PDF generation + share (`expo-print`, `expo-sharing`)
  - Speech + recognition (`expo-speech`, `expo-speech-recognition`)

## Core Features

### Patient
- Browse doctors and book appointments.
- Therapy catalog and therapy booking flow.
- View and download/share prescription PDFs.
- Chat with AI assistant.
- View notifications and appointment status.

### Doctor
- Dashboard with appointment activity and quick actions.
- Manage appointments and patient details.
- Create structured prescriptions.
- Join video consultation flow.
- Access doctor AI assistant mode.

### Shared / Platform
- Firebase authentication and persistent sessions.
- Firestore-backed real-time data.
- Payment metadata records for booking flows.

## Project Structure

```text
AyurSutra/
├── App.js
├── app.json
├── index.js
├── src/
│   ├── components/
│   ├── context/
│   ├── navigation/
│   ├── screens/
│   │   ├── common/
│   │   ├── doctor/
│   │   └── patient/
│   └── services/
└── assets/
```

## Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI (via `npx` is fine)
- For Android native runs:
  - Android Studio
  - Android SDK
  - ADB configured in `PATH`

## Setup

1. Clone repository:

   ```bash
   git clone <your-repo-url>
   cd AyurSutra
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (recommended):

   Create a `.env` file in project root:

   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   EXPO_PUBLIC_OPENAI_MODEL=gpt-4o-mini
   ```

   > `EXPO_PUBLIC_*` variables are read by Expo at build/runtime.

4. Firebase configuration:

   - Firebase setup currently lives in `src/services/firebase.js`.
   - Replace with your project values if you are using your own Firebase backend.

## Run the App

### Start Expo bundler

```bash
npm run start
```

### Run on Android (native)

```bash
npm run android
```

### Run on iOS (macOS only)

```bash
npm run ios
```

### Run web version

```bash
npm run web
```

## Important: Expo Go vs Native Build

This app includes native modules such as **Agora**.

- **Expo Go does not support arbitrary native modules** like `react-native-agora`.
- For video call and full native functionality, use:
  - `expo run:android` / `expo run:ios`, or
  - an EAS development build.

## Android Permissions

Configured in `app.json`:

- `android.permission.CAMERA`
- `android.permission.RECORD_AUDIO`

These are required for video/audio consultation features.

## Troubleshooting

### 1) Device shows `offline` in ADB

If you see errors like `adb: device offline`:

```bash
adb kill-server
adb start-server
adb devices
```

Then reconnect USB, accept debugging prompt on phone, and rerun:

```bash
npm run android
```

### 2) App works in Metro but not in Expo Go

Expected for native features (Agora). Use a native/dev build instead of Expo Go.

### 3) AI chat not responding

- Verify `EXPO_PUBLIC_OPENAI_API_KEY` is set.
- Check internet connectivity.
- Restart Metro after updating env vars.

### 4) Build fails after dependency changes

Try a clean install:

```bash
rm -rf node_modules package-lock.json
npm install
```

Then restart Expo.

## Scripts

From `package.json`:

- `npm run start` → Start Expo dev server
- `npm run android` → Build/run Android native app
- `npm run ios` → Build/run iOS native app
- `npm run web` → Run web target

## Security Notes (Recommended Improvements)

- Move Firebase credentials and sensitive service logic to secure backend where possible.
- Avoid direct client-side payment success marking in production.
- Add server-side verification for prescriptions and payment events.
- Use token-based secure Agora channel auth in production.

## Suggested Next Enhancements

- Razorpay/Stripe production gateway integration.
- Cloud Function based prescription signature verification.
- Admin analytics dashboard.
- E2E test coverage for booking and prescription flows.
- CI pipeline (lint, type checks, smoke tests).

---

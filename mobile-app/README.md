# Get It Done! Mobile App

React Native mobile application for iOS and Android built with Expo.

## Features

- Cross-platform (iOS & Android)
- Shared codebase with web app
- Native features:
  - Push notifications
  - Voice input
  - Biometric authentication
  - Offline mode
  - Home screen widgets
  - Calendar integration

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Run on Android
pnpm run android

# Run on iOS (Mac only)
pnpm run ios

# Run on web
pnpm run web
```

## Building for Production

### Android

```bash
# Build APK
eas build --platform android

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS

```bash
# Build for App Store
eas build --platform ios --profile production
```

## Environment Variables

Create `.env` file:

```
API_URL=https://api.getitdone.app/api
GOOGLE_CLIENT_ID=your_google_client_id
MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

## Tech Stack

- React Native 0.81
- Expo SDK 52
- React Navigation
- AsyncStorage
- Expo Notifications
- Expo Speech
- Expo LocalAuthentication

## Status

**Current:** Basic Expo app created  
**Next:** Implement core features (auth, tasks, dashboard)  
**Timeline:** 2-3 weeks for full implementation


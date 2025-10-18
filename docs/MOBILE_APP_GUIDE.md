# Mobile App Development Guide

**Platform:** React Native with Expo  
**Status:** Scaffolding created, ready for implementation

---

## Overview

The Get It Done! mobile app provides native iOS and Android experiences with 95% code sharing with the web app.

---

## Project Structure

```
mobile-app/
├── App.js                 # Main app entry
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── src/
│   ├── screens/          # Screen components
│   │   ├── OnboardingScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── TaskEntryScreen.js
│   │   └── SettingsScreen.js
│   ├── components/       # Reusable components
│   ├── services/         # API service (shared with web)
│   ├── navigation/       # React Navigation setup
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Helper functions
└── assets/              # Images, fonts, icons
```

---

## Core Features to Implement

### 1. Authentication (Week 1)

**Screens:**
- Login
- Registration (reuse onboarding flow)
- Biometric login (Face ID/Touch ID)

**Implementation:**
```javascript
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Biometric auth
const authenticateWithBiometrics = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Get It Done!',
      fallbackLabel: 'Use passcode',
    });
    
    if (result.success) {
      // Load saved credentials
      const token = await AsyncStorage.getItem('accessToken');
      // Auto-login
    }
  }
};
```

### 2. Task Management (Week 1-2)

**Screens:**
- Task list (Dashboard)
- Task entry (Voice + text)
- Task details
- Task completion

**Voice Input:**
```javascript
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

const startVoiceRecognition = async () => {
  try {
    await Voice.start('en-US');
    Voice.onSpeechResults = (e) => {
      const text = e.value[0];
      setTaskTitle(text);
    };
  } catch (error) {
    console.error('Voice recognition error:', error);
  }
};
```

### 3. Push Notifications (Week 2)

**Setup:**
```javascript
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Schedule notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Task due soon!",
    body: "Complete your homework by 5 PM",
    data: { taskId: '123' },
  },
  trigger: {
    date: new Date(Date.now() + 3600000), // 1 hour
  },
});

// Handle notification tap
Notifications.addNotificationResponseReceivedListener(response => {
  const taskId = response.notification.request.content.data.taskId;
  navigation.navigate('TaskDetails', { taskId });
});
```

### 4. Offline Mode (Week 2)

**Implementation:**
```javascript
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detect connectivity
const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected);
  });
  return () => unsubscribe();
}, []);

// Queue offline actions
const createTaskOffline = async (taskData) => {
  if (!isOnline) {
    // Save to local queue
    const queue = await AsyncStorage.getItem('offline_queue') || '[]';
    const tasks = JSON.parse(queue);
    tasks.push({ action: 'create', data: taskData });
    await AsyncStorage.setItem('offline_queue', JSON.stringify(tasks));
  } else {
    // Send to API
    await tasksAPI.create(taskData);
  }
};

// Sync when online
useEffect(() => {
  if (isOnline) {
    syncOfflineQueue();
  }
}, [isOnline]);
```

### 5. Home Screen Widgets (Week 3)

**iOS Widget (Swift):**
```swift
import WidgetKit
import SwiftUI

struct TodayTasksWidget: Widget {
    let kind: String = "TodayTasksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TodayTasksWidgetView(entry: entry)
        }
        .configurationDisplayName("Today's Tasks")
        .description("See your tasks for today")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

**Android Widget (Kotlin):**
```kotlin
class TaskWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
}
```

---

## Navigation Structure

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Add Task" component={TaskEntryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## Shared Code with Web App

### API Service (100% shared)

Copy `/get-it-done-app/src/services/api.js` to mobile app:
- Same authentication logic
- Same endpoints
- Same token management
- Only difference: AsyncStorage instead of localStorage

### Components (80% shared)

Many web components can be adapted:
- Onboarding flow logic
- Task entry logic
- Settings logic
- Gamification logic

**Example adaptation:**
```javascript
// Web: <div className="...">
// Mobile: <View style={styles.container}>

// Web: <button onClick={...}>
// Mobile: <TouchableOpacity onPress={...}>

// Web: <input type="text" />
// Mobile: <TextInput />
```

---

## Dependencies to Install

```bash
# Navigation
pnpm add @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
pnpm add react-native-screens react-native-safe-area-context

# Storage
pnpm add @react-native-async-storage/async-storage

# Networking
pnpm add axios @react-native-community/netinfo

# Voice
pnpm add @react-native-voice/voice expo-speech

# Notifications
# (included in Expo)

# Biometrics
# (included in Expo)

# Calendar
pnpm add react-native-calendar-events

# UI Components
pnpm add react-native-elements react-native-vector-icons
```

---

## App Configuration (app.json)

```json
{
  "expo": {
    "name": "Get It Done!",
    "slug": "get-it-done",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B4A6B"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.biglittlebusiness.getitdone",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "We need access to your microphone for voice task entry",
        "NSCalendarsUsageDescription": "We need access to your calendar to sync tasks",
        "NSFaceIDUsageDescription": "We use Face ID to securely log you in"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B4A6B"
      },
      "package": "com.biglittlebusiness.getitdone",
      "permissions": [
        "RECORD_AUDIO",
        "READ_CALENDAR",
        "WRITE_CALENDAR",
        "USE_BIOMETRIC",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    "plugins": [
      "expo-notifications",
      "expo-local-authentication",
      "@react-native-voice/voice"
    ]
  }
}
```

---

## Building for App Stores

### Setup EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

### iOS App Store

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Google Play Store

```bash
# Build AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## Testing

### Local Testing

```bash
# iOS Simulator (Mac only)
pnpm run ios

# Android Emulator
pnpm run android

# Expo Go app (physical device)
pnpm start
# Scan QR code with Expo Go app
```

### TestFlight (iOS)

1. Build with EAS
2. Upload to App Store Connect
3. Add internal testers
4. Distribute beta

### Google Play Internal Testing

1. Build AAB with EAS
2. Upload to Play Console
3. Create internal testing track
4. Add testers by email

---

## Performance Optimization

### Code Splitting

```javascript
import { lazy, Suspense } from 'react';

const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));

<Suspense fallback={<LoadingSpinner />}>
  <DashboardScreen />
</Suspense>
```

### Image Optimization

```javascript
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

// Use FastImage for better performance
<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.normal }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### List Performance

```javascript
import { FlatList } from 'react-native';

<FlatList
  data={tasks}
  renderItem={({ item }) => <TaskItem task={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

## Estimated Timeline

**Week 1:** Authentication + Basic UI  
**Week 2:** Task management + Notifications  
**Week 3:** Offline mode + Polish  
**Week 4:** Testing + App Store submission

**Total:** 3-4 weeks for MVP

---

## Next Steps

1. **Install dependencies** - Navigation, storage, etc.
2. **Copy API service** - Adapt from web app
3. **Build authentication** - Login, register, biometrics
4. **Implement dashboard** - Task list and stats
5. **Add voice input** - Speech recognition
6. **Setup notifications** - Push notifications
7. **Test on devices** - iOS and Android
8. **Submit to stores** - TestFlight and Play Store

---

## Resources

- **Expo Docs:** https://docs.expo.dev
- **React Navigation:** https://reactnavigation.org
- **React Native:** https://reactnative.dev
- **EAS Build:** https://docs.expo.dev/build/introduction

---

## Status

- ✅ Expo project created
- ✅ Basic structure defined
- ⏳ Dependencies to be installed
- ⏳ Screens to be implemented
- ⏳ API integration needed
- ⏳ Native features to be added
- ⏳ Testing required
- ⏳ App store submission pending


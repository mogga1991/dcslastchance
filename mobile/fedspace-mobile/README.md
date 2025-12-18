# FedSpace Mobile 📱

> Professional Mobile Platform for Federal Government Leasing & Commercial Real Estate

**Enterprise-grade MVP mobile application for commercial real estate brokers to discover and manage federal government leasing opportunities on the go.**

---

## 🚀 Core Features (MVP)

### ✅ Implemented
- **📊 Opportunities Feed** - Browse federal lease opportunities matched to your properties
- **🏢 Property Management** - View and manage your commercial real estate portfolio
- **👤 Account & Settings** - Professional profile with performance metrics
- **🎨 Native UI** - Clean, enterprise-grade design with smooth performance

### 🔜 Planned Features
- ✨ Push Notifications (new matches, deadline reminders)
- 🔐 Biometric Authentication (Face ID / Touch ID)
- 📊 Advanced Analytics Dashboard
- 🌐 Offline Mode (cache data locally)
- 📧 Email Integration (send proposals directly)
- 📞 Click-to-Call (contact agencies)

---

## 📦 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: React Native built-in + Custom components
- **Animations**: React Native Reanimated & Gesture Handler
- **Icons**: Ionicons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

---

## 🛠️ Installation

### Prerequisites

1. **Node.js** (v18 or later)
   ```bash
   node --version
   ```

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **iOS Simulator** (Mac only)
   - Install Xcode from the App Store
   - Open Xcode → Preferences → Components → Install iOS Simulator

4. **Android Studio** (for Android development)
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and create a virtual device

### Setup Steps

1. **Navigate to mobile app directory**
   ```bash
   cd mobile/fedspace-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on a device**
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan QR code with Expo Go app
     - iOS: [Download Expo Go](https://apps.apple.com/app/expo-go/id982107779)
     - Android: [Download Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 📱 Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser (limited features)
```

### Project Structure

```
fedspace-mobile/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Bottom tab navigation (3 tabs)
│   │   ├── index.tsx      # 📊 Opportunities Feed
│   │   ├── properties.tsx # 🏢 Properties Management
│   │   └── profile.tsx    # 👤 Account & Settings
│   └── _layout.tsx        # Root layout with navigation
├── assets/                # Images, fonts, icons
├── components/            # Reusable components (future)
├── lib/                   # Utilities, API clients (future)
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── README.md             # This file
```

---

## 🎨 Design System

### Colors
- **Primary**: `#4F46E5` (Indigo 600)
- **Success**: `#10B981` (Green 500)
- **Warning**: `#F59E0B` (Amber 500)
- **Error**: `#EF4444` (Red 500)
- **Background**: `#F9FAFB` (Gray 50)
- **Text Primary**: `#111827` (Gray 900)
- **Text Secondary**: `#6B7280` (Gray 500)

### Typography
- **Headings**: SF Pro Display (iOS) / Roboto (Android)
- **Body**: SF Pro Text (iOS) / Roboto (Android)
- **Sizes**: 10px - 20px

---

## 🔑 Key Features Explained

### 1. Opportunities Feed (Main Tab)

Professional feed of federal lease opportunities matched to your properties:
- **Structured Data** - Agency, solicitation number, location, deadlines, estimated value
- **Match Analytics** - Match score percentage and "Why This Matches" insights
- **Quick Stats** - Total matches, hot matches, unreviewed count
- **Action Buttons** - Pass, Save, or Mark as Interested

**Implementation highlights**:
- ScrollView for smooth browsing
- Expandable sections for detailed match reasoning
- Color-coded badges (HOT MATCH, match score, expiration status)
- Professional card layout with clean typography

### 2. Property Management

View and manage your commercial real estate portfolio:
- **Performance Summary** - Total matches, average match score, total agency views
- **Property Cards** - Each listing shows available SF, match count, and best match score
- **Status Tracking** - Active/Pending status badges
- **Quick Access** - "View Matches" button to see opportunities for each property

### 3. Account & Settings

Professional account management and performance metrics:
- **Performance Metrics** - Total matches, opportunities won, response rate, active properties
- **Account Settings** - Edit profile, company information, notification preferences
- **Support** - Help center and terms & privacy access
- **App Version** - Version information displayed at bottom

---

## 📲 Push Notifications (Planned)

FedSpace Mobile will support push notifications for:
- 🔥 **High-Priority Matches** - 90%+ matches expiring soon
- ⏰ **Deadline Reminders** - 7 days, 3 days, 1 day before due
- 🏆 **Wins** - When your proposal is accepted
- 📊 **Property Views** - When agencies view your listings

**Setup** (will be implemented):
```bash
expo install expo-notifications
```

### iOS Setup
1. Enable Push Notifications in Xcode capabilities
2. Configure APNs certificates
3. Add to `app.json`:
   ```json
   "notification": {
     "iosDisplayInForeground": true
   }
   ```

### Android Setup
1. Configure Firebase Cloud Messaging
2. Add `google-services.json`
3. Set notification icon and color

---

## 🔐 Biometric Authentication (Planned)

Secure login with Face ID (iOS) and Fingerprint (Android).

**Implementation**:
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access FedSpace',
    });
    return result.success;
  }
  return false;
};
```

---

## 🌐 Backend Integration

### Supabase Setup

1. **Install Supabase client**
   ```bash
   npm install @supabase/supabase-js react-native-url-polyfill
   ```

2. **Create Supabase client**
   ```typescript
   // lib/supabase.ts
   import 'react-native-url-polyfill/auto';
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.EXPO_PUBLIC_SUPABASE_URL!,
     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

3. **Fetch opportunities**
   ```typescript
   const { data: matches, error } = await supabase
     .from('opportunities')
     .select('*')
     .eq('user_id', userId)
     .order('match_score', { ascending: false });
   ```

---

## 📝 Building for Production

### iOS Build

1. **Configure app.json**
   ```json
   "ios": {
     "bundleIdentifier": "com.fedspace.mobile",
     "buildNumber": "1.0.0"
   }
   ```

2. **Build with EAS**
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### Android Build

1. **Configure app.json**
   ```json
   "android": {
     "package": "com.fedspace.mobile",
     "versionCode": 1
   }
   ```

2. **Build with EAS**
   ```bash
   eas build --platform android
   ```

3. **Submit to Google Play**
   ```bash
   eas submit --platform android
   ```

---

## 🧪 Testing

### Manual Testing
```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Automated Testing (Future)
```bash
# Unit tests with Jest
npm test

# E2E tests with Detox
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Expo Go app not connecting"**
- Ensure your phone and computer are on the same WiFi network
- Try disabling your firewall temporarily
- Use tunnel mode: `expo start --tunnel`

**2. "Android emulator not starting"**
- Open Android Studio → AVD Manager → Create Virtual Device
- Ensure virtualization is enabled in BIOS
- Allocate more RAM to the emulator

**3. "iOS simulator not found"**
- Run: `xcode-select --install`
- Open Xcode and install additional simulators
- Try: `expo start --ios`

**4. "Module not found" errors**
- Clear cache: `expo start --clear`
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router Guide](https://expo.github.io/router/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [FedSpace Web App](../README.md) (parent project)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Copyright © 2024 FedSpace. All rights reserved.

---

## 🙋 Support

- **Email**: support@fedspace.com
- **Docs**: https://docs.fedspace.com
- **Community**: https://community.fedspace.com

---

**Built for commercial real estate professionals and government contractors**

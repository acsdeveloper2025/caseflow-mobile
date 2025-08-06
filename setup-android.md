# Convert CaseFlow Mobile to Android APK

## Prerequisites
- Android Studio installed
- Android SDK configured
- Java 11+ installed

## Step 1: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

## Step 2: Initialize Capacitor
```bash
npx cap init "CaseFlow Mobile" "com.caseflow.mobile"
```

## Step 3: Build the web app
```bash
npm run build
```

## Step 4: Add Android platform
```bash
npx cap add android
```

## Step 5: Copy web assets
```bash
npx cap copy android
```

## Step 6: Open in Android Studio
```bash
npx cap open android
```

## Step 7: Build APK in Android Studio
1. In Android Studio, go to Build > Build Bundle(s) / APK(s) > Build APK(s)
2. Wait for the build to complete
3. APK will be generated in `android/app/build/outputs/apk/debug/`

## Alternative: Command Line APK Build
```bash
cd android
./gradlew assembleDebug
```

## Current Access Methods

### 1. Web Browser (Immediate)
- **Local:** http://localhost:5173/
- **Network:** http://192.168.1.25:5173/
- Access from any device on your network

### 2. Android Emulator
1. Start your AVD emulator
2. Open Chrome browser
3. Navigate to: http://192.168.1.25:5173/

### 3. Physical Android Device
1. Connect to same WiFi network
2. Open Chrome browser
3. Navigate to: http://192.168.1.25:5173/

## PWA Installation
The app can be installed as a PWA:
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Select "Add to Home Screen"
4. The app will behave like a native app

## Notes
- The current app is a React web application
- It's optimized for mobile viewing with responsive design
- All verification forms work in mobile browsers
- Touch interactions are supported

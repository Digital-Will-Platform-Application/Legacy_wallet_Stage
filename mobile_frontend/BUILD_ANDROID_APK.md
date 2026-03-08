# How to Build Android APK with Expo

## Prerequisites

1. **Expo Account**: You need an Expo account at https://expo.dev
   - Your account: `kreddyking`
   - Project: `digital-will-application`

2. **EAS CLI**: Already installed ✅

## Step-by-Step Guide

### Step 1: Login to Expo

```bash
cd mobile_frontend
eas login
```

Enter your Expo credentials (username: `kreddyking`)

### Step 2: Configure EAS Project (First Time Only)

```bash
eas build:configure
```

This will:
- Link your project to your Expo account
- Create the EAS project configuration
- Set up build profiles

### Step 3: Build Android APK

#### Option A: Preview/Development APK (Recommended for Testing)

```bash
eas build --platform android --profile preview
```

This builds an APK that can be installed directly on Android devices.

#### Option B: Production APK

```bash
eas build --platform android --profile production
```

This builds a signed APK ready for Google Play Store.

### Step 4: Monitor Build Progress

- The build will upload your code to Expo servers
- Build time: 10-20 minutes
- You'll see progress in the terminal
- You can also check: https://expo.dev/accounts/kreddyking/projects/digital-will-application/builds

### Step 5: Download APK

Once build completes:
- You'll get a download link in the terminal
- Or visit: https://expo.dev/accounts/kreddyking/projects/digital-will-application/builds
- Download the APK file
- Install on Android device (enable "Install from unknown sources" if needed)

## Build Profiles Explained

### Preview Profile
- **Purpose**: Testing and internal distribution
- **Build Type**: APK
- **Signing**: Expo managed
- **Use Case**: Share with testers, install on devices

### Production Profile
- **Purpose**: Release to Google Play Store
- **Build Type**: APK or AAB (Android App Bundle)
- **Signing**: Requires keystore (Expo can manage)
- **Use Case**: Publish to Play Store

## Configuration Files

### `eas.json`
Contains build profiles and configuration:
- `preview`: For testing APKs
- `production`: For Play Store releases

### `app.config.js`
Contains app metadata:
- Package name: `com.digitalwill.legacywallet`
- Version: `1.0.0`
- Owner: `kreddyking`
- Slug: `digital-will-application`

## Troubleshooting

### "EAS project not configured"
Run: `eas build:configure`

### "Not logged in"
Run: `eas login`

### "Build failed"
- Check build logs at: https://expo.dev/accounts/kreddyking/projects/digital-will-application/builds
- Common issues:
  - Missing environment variables
  - Invalid app configuration
  - Network issues

## Quick Commands Reference

```bash
# Login
eas login

# Configure project (first time)
eas build:configure

# Build preview APK
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production

# Check build status
eas build:list

# View build details
eas build:view
```

## Alternative: Local Build (Advanced)

If you have Android Studio installed:

```bash
npx expo run:android
```

This builds locally but requires:
- Android Studio
- Android SDK
- More setup time

## Resources

- Expo EAS Build Docs: https://docs.expo.dev/build/introduction/
- Your Project: https://expo.dev/accounts/kreddyking/projects/digital-will-application
- Build Dashboard: https://expo.dev/accounts/kreddyking/projects/digital-will-application/builds

# Φ_SENTINEL · SAGE v4.0 — APK Build Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | `node -v` |
| JDK | 17+ | `java -version` |
| Android Studio | Hedgehog+ | Or SDK CLI tools |
| Android SDK | API 34 | Set `ANDROID_HOME` |
| adb | any | For device install |

---

## Quick Build

```bash
# 1. Install deps + build + init Android project
chmod +x build.sh
./build.sh
```

The script will pause and ask you to apply manifest changes (one time only).

---

## Manual Step-by-Step

### 1. Install dependencies
```bash
npm install
```

### 2. Build React app
```bash
npm run build
# → outputs to dist/
```

### 3. Initialize Android project (first time only)
```bash
npx cap add android
```

### 4. Apply Android permissions & network config

**Copy network security config:**
```bash
mkdir -p android/app/src/main/res/xml
cp android-hints/network_security_config.xml \
   android/app/src/main/res/xml/network_security_config.xml
```

**Edit `android/app/src/main/AndroidManifest.xml`:**
- Add all permissions from `android-hints/AndroidManifest_additions.xml`
- Add to `<application>` tag:
  ```xml
  android:usesCleartextTraffic="true"
  android:networkSecurityConfig="@xml/network_security_config"
  ```

### 5. Sync web assets
```bash
npx cap sync android
```

### 6. Build APK
```bash
# Debug APK (no signing needed)
cd android && ./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 7. Install to device
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Running in Browser (Dev)
```bash
npm run dev
# → http://localhost:5173
```
Full UI works in browser. Capacitor plugins (motion, haptics) degrade gracefully — no errors.

---

## Connecting to SAGE Brain (on Moto G Stylus)

SAGE Bridge and Ollama run on `localhost` from the phone's perspective — no special configuration needed if they're running in Termux on the **same device**.

| Service | Default URL |
|---------|------------|
| SAGE Bridge (FastAPI) | `http://localhost:8000` |
| Ollama | `http://localhost:11434` |
| Gemini | Uses your Google API key (Settings tab) |

If connecting to a **different machine** on LAN, use that machine's IP (e.g. `http://192.168.1.x:8000`).

---

## App ID & Signing

- App ID: `com.sage.phisentinel`
- For Play Store / sideload release:
  ```bash
  keytool -genkey -v -keystore phi-sentinel-release.keystore \
    -alias phi-sentinel -keyalg RSA -keysize 2048 -validity 10000
  cd android && ./gradlew assembleRelease
  ```

---

## Sensor Mapping (Native → Neurochemistry)

| Phone Sensor | Maps To |
|-------------|---------|
| Accelerometer magnitude | Adrenaline + Norepinephrine |
| QUANTUM_SYNCHRONICITY_EVENT | Heavy haptic vibration |
| Camera (rear) | VisionMatrix grayscale feed |

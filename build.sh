#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# Φ_SENTINEL APK Build Script
# Prerequisites:
#   - Node.js 18+
#   - Android Studio (with SDK 34) OR Android SDK CLI tools
#   - Java 17+ (JDK)
#   - JAVA_HOME set
#   - ANDROID_HOME set (e.g. ~/Android/Sdk)
#
# On Termux (your Moto G Stylus):
#   pkg install nodejs openjdk-17
#   npm install -g @capacitor/cli
#   Then use Android Studio on a machine to assemble, or use remote build.
# ─────────────────────────────────────────────────────────────────────────

set -e
echo "▶ Φ_SENTINEL build starting..."

# 1. Install JS dependencies
echo "▶ npm install..."
npm install

# 2. Build React → dist/
echo "▶ vite build..."
npm run build

# 3. Init Capacitor Android project (first time only)
if [ ! -d "android" ]; then
  echo "▶ Initializing Capacitor Android project..."
  npx cap add android

  echo "▶ Applying AndroidManifest permissions..."
  # The android-hints/ files need to be merged manually or via the patch below
  echo ""
  echo "⚠  MANUAL STEP REQUIRED:"
  echo "   1. Copy android-hints/network_security_config.xml"
  echo "      → android/app/src/main/res/xml/network_security_config.xml"
  echo "   2. Merge android-hints/AndroidManifest_additions.xml"
  echo "      → android/app/src/main/AndroidManifest.xml"
  echo "   3. Re-run this script"
  echo ""
  read -p "Press enter once you've applied the manifest changes..."
fi

# 4. Sync web assets into Android project
echo "▶ cap sync..."
npx cap sync android

# 5. Build debug APK
echo "▶ Building debug APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "✅ APK built successfully!"
  echo "   Location: android/$APK_PATH"
  echo ""
  echo "▶ Install to connected device?"
  read -p "   (press enter to install via adb, Ctrl+C to skip) "
  adb install -r "$APK_PATH"
  echo "✅ Installed on device."
else
  echo "❌ Build failed — check Gradle output above."
  exit 1
fi

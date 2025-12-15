# 🚀 Android Development - Quick Reference

## Start Here

```bash
# 1. Start emulator (via Android Studio)
# Tools → Device Manager → Start emulator

# 2. Deploy app
npm run android:deploy
```

---

## Common Commands

### Build & Deploy

```bash
# Full rebuild and deploy
npm run build
npx cap sync
npm run android:deploy

# Or in one command
npm run cap:run:android
```

### Development

```bash
# Web development (fastest)
npm run dev

# Android with live reload (after emulator started)
npm run cap:run:android:live
```

### Device Management

```bash
# Check devices
adb devices

# Restart ADB
adb kill-server
adb start-server
```

### App Management

```bash
# Restart app
adb shell am start -n nl.parallax.darktech/.MainActivity

# Stop app
adb shell am force-stop nl.parallax.darktech

# Uninstall
adb uninstall nl.parallax.darktech

# View logs
adb logcat | Select-String "Capacitor"
```

---

## Troubleshooting

### "ERR_CONNECTION_REFUSED"

**Fix**: Remove `server` config from `capacitor.config.ts`, then rebuild:

```bash
npm run build
npx cap sync
npm run android:deploy
```

### "device still authorizing"

**Fix**: Wait for emulator to fully boot (see Android homescreen)

### Changes not showing

**Fix**: Rebuild and sync:

```bash
npm run build
npx cap sync
npm run android:deploy
```

### Camera not working

**Fix**: Check permissions in Settings → Apps → Dark Tech → Permissions

---

## File Locations

```
APK:     android/app/build/outputs/apk/debug/app-debug.apk
Config:  capacitor.config.ts
Assets:  dist/ (copied to android/app/src/main/assets/public/)
```

---

## Quick Fixes

```bash
# Clean everything
adb uninstall nl.parallax.darktech
cd android && ./gradlew clean && cd ..
npm run build
npx cap sync
npm run android:deploy

# Force rebuild
npm run build
npx cap sync

# Restart emulator
# Close emulator, wait, start again via Android Studio
```

---

## When to Use What

- **Web (`npm run dev`)**: UI/CSS/logic development
- **Deploy script**: Testing complete features
- **Live reload**: Active Android development with HMR
- **Android Studio**: Most reliable, use for first time

---

**Need help?** Check `ANDROID-WORKFLOW.md` for detailed guide

